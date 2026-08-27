/* Paper lifecycle routes: blueprints, generation, submit, review chain,
 * vaulting. Approval authority is enforced here — never in the client. */
import { Router } from 'express'
import { pool } from '../config/db.js'
import { requirePermission } from '../middleware/rbac.middleware.js'
import { audit } from '../middleware/audit.middleware.js'
import { validateBlueprint, validateGeneratedPaper } from '../services/rules-engine.service.js'
import { encryptBuffer, documentHash, signDocument } from '../security/vault-crypto.js'
import { config } from '../config/env.js'

const r = Router()

/* ---------- Blueprints ---------- */
r.post('/blueprints', requirePermission('blueprint.manage'), async (req, res) => {
  const issues = validateBlueprint(req.body)
  if (issues.some(i => i.level === 'error')) return res.status(422).json({ error: 'BLUEPRINT_INVALID', issues })
  const { rows } = await pool.query(
    `INSERT INTO exam_patterns (subject_id, organization_id, spec_json, created_by)
     VALUES ($1,$2,$3,$4) RETURNING id`,
    [req.body.subjectId, req.auth.organizationId, req.body, req.auth.userId],
  )
  await audit(req, 'BLUEPRINT_CREATED', 'blueprint', rows[0].id)
  res.status(201).json({ id: rows[0].id })
})

/* ---------- Multi-set generation ---------- */
r.post('/generate', requirePermission('paper.create'), async (req, res) => {
  const { blueprintId, setCount = 3 } = req.body
  const bp = await loadBlueprint(blueprintId, req.auth.organizationId)
  if (!bp) return res.status(404).json({ error: 'BLUEPRINT_NOT_FOUND' })

  // Selection is constrained by blueprint + bank; equivalence enforced below.
  const sets = await buildEquivalentSets(bp, setCount)
  const issues = validateGeneratedPaper(bp.spec, sets)
  if (issues.some(i => i.level === 'error')) {
    return res.status(422).json({ error: 'GENERATION_CONSTRAINT_VIOLATION', issues })
  }

  const paperId = await persistPaper(bp, sets, req.auth)
  await audit(req, 'PAPER_CREATED', 'question_paper', paperId)
  res.status(201).json({ id: paperId, qualitySummary: computeQuality(sets) })
})

/* ---------- Approval chain — four-eyes model ---------- */
r.post('/:id/submit', requirePermission('paper.submit'), async (req, res) => {
  await transition(req, req.params.id, 'SUBMITTED', 'STAFF_SUBMISSION', 'SUBMITTED', 'paper.submit')
})

r.post('/:id/approve', async (req, res) => {
  const stage = currentStage(req.params.id)
  const permForStage = {
    DEPARTMENT_HEAD_REVIEW: 'paper.review.department',
    COLLEGE_REVIEW: 'paper.review.college',
    UNIVERSITY_APPROVAL: 'paper.approve.university',
  }
  requirePermission(permForStage[stage])(req, res, () =>
    transition(req, req.params.id, nextStatus(stage), stage, 'APPROVED'))
})

r.post('/:id/reject', async (req, res) => {
  const stage = currentStage(req.params.id)
  requirePermission('paper.review.department')(req, res, () =>
    transition(req, req.params.id, 'CHANGES_REQUESTED', stage, 'REJECTED', req.body.comment))
})

/* ---------- Vault sealing ---------- */
r.post('/:id/seal', requirePermission('paper.approve.university'), async (req, res) => {
  // Render final PDF → hash → AES-256-GCM envelope → HMAC signature.
  const pdf = Buffer.from(await renderPdf(req.params.id))
  const hash = documentHash(pdf)
  const sealed = encryptBuffer(pdf, config.vaultEncKey)
  const sig = signDocument(hash, req.auth.userId, req.auth.role, new Date().toISOString(), config.vaultHashPepper)
  await pool.query(
    `UPDATE question_papers SET status='IN_VAULT',
       vault_payload=$2, document_hash=$3, signature=$4, signed_by=$5
     WHERE id=$1 AND organization_id=$6`,
    [req.params.id, JSON.stringify(sealed), hash, sig, req.auth.userId, req.auth.organizationId],
  )
  await audit(req, 'VAULT_ACCESS', 'vault_record', req.params.id, 'SUCCESS', { operation: 'SEAL' })
  res.json({ sealed: true, hash })
})

/** Vault download — blocked unless an ACTIVE release window exists. */
r.get('/:id/download', requirePermission('paper.download'), async (req, res) => {
  const { rows } = await pool.query(
    `SELECT 1 FROM paper_releases
      WHERE paper_id=$1 AND status='ACTIVE' AND now() BETWEEN release_at AND expires_at`,
    [req.params.id],
  )
  if (rows.length === 0) {
    await audit(req, 'PAPER_ACCESS_DENIED', 'question_paper', req.params.id, 'DENIED')
    return res.status(423).json({ error: 'RELEASE_LOCKED', message: 'Paper is locked until its scheduled release.' })
  }
  await audit(req, 'PAPER_DOWNLOADED', 'question_paper', req.params.id)
  res.json({ ok: true /* stream decrypted PDF with watermark */ })
})

export default r

/* ---- helpers (abridged for the skeleton; full impls in services/) ---- */
async function loadBlueprint(id, orgId) {
  const { rows } = await pool.query(
    'SELECT * FROM exam_patterns WHERE id=$1 AND organization_id=$2', [id, orgId])
  return rows[0] ? { ...rows[0], spec: rows[0].spec_json } : null
}
async function buildEquivalentSets(_bp, n) {
  // Pair conceptually comparable questions per topic/difficulty across sets.
  return Array.from({ length: n }, (_, i) => ({ label: String.fromCharCode(65 + i), questions: [] }))
}
async function persistPaper(bp, sets, auth) {
  const { rows } = await pool.query(
    `INSERT INTO question_papers (subject_id, organization_id, exam_pattern_id, status, sets_json, created_by)
     VALUES ($1,$2,$3,'DRAFT',$4,$5) RETURNING id`,
    [bp.subject_id, auth.organizationId, bp.id, JSON.stringify(sets), auth.userId],
  )
  return rows[0].id
}
function computeQuality() {
  return { syllabusCoveragePct: 0, duplicateScore: 0, validationScore: 100, setEquivalenceScore: 1 }
}
async function renderPdf() { return '' }
function currentStage() { return 'DEPARTMENT_HEAD_REVIEW' }
function nextStatus(stage) {
  return stage === 'UNIVERSITY_APPROVAL' ? 'APPROVED' : 'UNDER_REVIEW'
}
