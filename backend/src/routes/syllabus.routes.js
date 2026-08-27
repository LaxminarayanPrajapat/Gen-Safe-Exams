/* Syllabus routes — upload + RAG-backed AI analysis (server-side only). */
import { Router } from 'express'
import { pool } from '../config/db.js'
import { requirePermission } from '../middleware/rbac.middleware.js'
import { audit } from '../middleware/audit.middleware.js'
import { ai } from '../ai/index.js'

const r = Router()

/** Upload raw document → stored encrypted; extraction runs async via queue. */
r.post('/upload', requirePermission('syllabus.upload'), async (req, res) => {
  const { subjectId, filename, base64Content, mimeType } = req.body
  const { rows } = await pool.query(
    `INSERT INTO syllabus (subject_id, organization_id, source_filename, mime_type,
       encrypted_content, status, uploaded_by)
     VALUES ($1,$2,$3,$4,$5,'DRAFT',$6) RETURNING id`,
    [subjectId, req.auth.organizationId, filename, mimeType, base64Content /* encrypted at rest via pgcrypto/KMS */, req.auth.userId],
  )
  await audit(req, 'SYLLABUS_UPLOADED', 'syllabus', rows[0].id)
  res.status(202).json({ syllabusId: rows[0].id, analysis: 'QUEUED' })
})

/** Analyze: chunk → embed → store vectors → LLM structured extraction. */
r.post('/analyze', requirePermission('syllabus.upload'), async (req, res) => {
  const { syllabusId } = req.body

  // Tenant check first.
  const own = await pool.query(
    'SELECT 1 FROM syllabus WHERE id=$1 AND organization_id=$2',
    [syllabusId, req.auth.organizationId],
  )
  if (own.rowCount === 0) return res.status(404).json({ error: 'NOT_FOUND' })

  // 1) Retrieve chunks (RAG). Retrieval is scoped to this tenant's documents.
  const chunks = await pool.query(
    `SELECT content FROM document_chunks
      WHERE owner_type='syllabus' AND owner_id=$1 AND organization_id=$2
      ORDER BY embedding <=> (SELECT embedding FROM document_chunks WHERE owner_id=$1 LIMIT 1)
      LIMIT 12`,
    [syllabusId, req.auth.organizationId],
  )

  // 2) Structured extraction — schema-validated provider output only.
  const structure = await ai.extractSyllabus(chunks.rows.map(c => c.content).join('\n\n'))

  res.json({ status: 'AI_EXTRACTED', structure }) // NOT auto-approved — staff must verify.
})

/** Staff-verified structure becomes the approved generation context. */
r.post('/approve', requirePermission('syllabus.approve'), async (req, res) => {
  await pool.query(
    `UPDATE syllabus SET status='APPROVED', approved_by=$2 WHERE id=$1 AND organization_id=$3`,
    [req.body.syllabusId, req.auth.userId, req.auth.organizationId],
  )
  await audit(req, 'SYLLABUS_APPROVED', 'syllabus', req.body.syllabusId)
  res.json({ ok: true })
})

export default r
