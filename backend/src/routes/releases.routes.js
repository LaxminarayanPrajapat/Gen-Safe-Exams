/* Scheduled release routes — the ONLY path to open a vaulted paper. */
import { Router } from 'express'
import { pool } from '../config/db.js'
import { requirePermission } from '../middleware/rbac.middleware.js'
import { audit } from '../middleware/audit.middleware.js'

const r = Router()

r.post('/', requirePermission('release.schedule'), async (req, res) => {
  const { paperId, releaseAt, examAt } = req.body
  const { rows } = await pool.query(
    `INSERT INTO paper_releases (paper_id, organization_id, release_at, exam_at, status)
     VALUES ($1,$2,$3,$4,'SCHEDULED') RETURNING id`,
    [paperId, req.auth.organizationId, releaseAt, examAt],
  )
  await audit(req, 'RELEASE_SCHEDULED', 'release', rows[0].id)
  res.status(201).json({ id: rows[0].id })
})

r.post('/:id/activate', requirePermission('release.activate'), async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE paper_releases SET status='ACTIVE', activated_by=$2, activated_at=now()
      WHERE id=$1 AND organization_id=$3 AND status='SCHEDULED' RETURNING id`,
    [req.params.id, req.auth.userId, req.auth.organizationId],
  )
  if (rows.length === 0) return res.status(409).json({ error: 'NOT_ACTIVATABLE' })
  await audit(req, 'PAPER_RELEASED', 'release', req.params.id)
  res.json({ ok: true })
})

export default r
