/* Question routes — generation, validation, bank listing, review. */
import { Router } from 'express'
import { pool } from '../config/db.js'
import { requirePermission } from '../middleware/rbac.middleware.js'
import { audit } from '../middleware/audit.middleware.js'
import { ai } from '../ai/index.js'
import {
  validateGeneratedQuestions, findDuplicates,
} from '../services/rules-engine.service.js'

const r = Router()

/** AI generation. The LLM is called HERE (server-side); the frontend
 *  never sees API keys and never talks to a model directly. */
r.post('/generate', requirePermission('question.generate'), async (req, res) => {
  const { subjectId, unit, topic, learningOutcome, type, marks, difficulty, bloom, count = 3 } = req.body

  // Approved-syllabus context only (RAG), scoped to tenant.
  const ctx = await pool.query(
    `SELECT s.id FROM syllabus s JOIN subjects sub ON sub.id = s.subject_id
      WHERE s.subject_id=$1 AND s.status='APPROVED' AND sub.department_id=$2`,
    [subjectId, req.auth.organizationId],
  )
  if (ctx.rowCount === 0) {
    return res.status(409).json({ error: 'NO_APPROVED_SYLLABUS', message: 'Upload and approve a syllabus first.' })
  }

  const raw = await ai.generateQuestions({ subjectId, unit, topic, learningOutcome, type, marks, difficulty, bloom, count })

  // Rules engine validates EVERY candidate before persistence.
  const approvedSyllabus = await loadApprovedStructure(subjectId)
  const validated = []
  for (const q of raw.questions) {
    const failures = validateGeneratedQuestions(q, approvedSyllabus)
    const embedding = (await ai.embed([q.text]))[0]
    const duplicates = await findDuplicates(pool, embedding, req.auth.organizationId)
    validated.push({ ...q, ruleFailures: failures, duplicates: duplicates.map(d => ({ id: d.id, similarity: d.similarity })) })
  }

  // Persist as PENDING_REVIEW — usable in papers only after human approval.
  const inserted = []
  for (const q of validated.filter(v => v.ruleFailures.length === 0)) {
    const { rows } = await pool.query(
      `INSERT INTO questions (subject_id, organization_id, unit, topic, question_text,
         question_type, difficulty, bloom_level, marks, reference_answer,
         ai_generated, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,'PENDING_REVIEW',$11)
       RETURNING id`,
      [subjectId, req.auth.organizationId, unit, q.topic, q.text, q.type,
        q.difficulty, q.bloom, q.marks, q.referenceAnswer ?? '', req.auth.userId],
    )
    await pool.query(
      `INSERT INTO question_embeddings (question_id, embedding) VALUES ($1, $2::vector)`,
      [rows[0].id, JSON.stringify((await ai.embed([q.text]))[0])],
    )
    inserted.push(rows[0].id)
  }
  await audit(req, 'QUESTION_GENERATED', 'question_batch', `${subjectId}:${Date.now()}`, 'SUCCESS',
    { requested: count, stored: inserted.length, rejected: validated.length - inserted.length })
  res.json({ candidates: validated, storedIds: inserted })
})

/** Human review decision. */
r.post('/:id/approve', requirePermission('question.approve'), async (req, res) => {
  await pool.query(
    `UPDATE questions SET status='APPROVED', reviewed_by=$2 WHERE id=$1 AND organization_id=$3`,
    [req.params.id, req.auth.userId, req.auth.organizationId],
  )
  await audit(req, 'QUESTION_APPROVED', 'question', req.params.id)
  res.json({ ok: true })
})

r.get('/', requirePermission('question.view'), async (req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM questions WHERE organization_id=$1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 200`,
    [req.auth.organizationId],
  )
  res.json(rows)
})

async function loadApprovedStructure(subjectId) {
  const { rows } = await pool.query(
    `SELECT structure_json FROM syllabus WHERE subject_id=$1 AND status='APPROVED' LIMIT 1`,
    [subjectId],
  )
  return rows[0]?.structure_json ?? { units: [] }
}

export default r
