/* Audit + security event read APIs — read-only by design. */
import { Router } from 'express'
import { pool } from '../config/db.js'
import { requirePermission } from '../middleware/rbac.middleware.js'
import { authenticate } from '../middleware/auth.middleware.js'

const r = Router()

r.get('/audit-logs', requirePermission('audit.view'), async (req, res) => {
  const limit = Math.min(500, parseInt(String(req.query.limit ?? '100')))
  const offset = parseInt(String(req.query.offset ?? '0'))
  // Tenant scoping: auditors see their university subtree only.
  const params = [req.auth.organizationId, limit, offset]
  const scopeSql = req.auth.role === 'AUDITOR'
    ? 'organization_id = ANY(organization_subtree($1))'
    : 'organization_id = $1 OR $1 IS NULL'
  const { rows } = await pool.query(
    `SELECT * FROM audit_logs WHERE ${scopeSql} ORDER BY occurred_at DESC LIMIT $2 OFFSET $3`,
    req.auth.role === 'SUPER_ADMIN' ? [null, limit, offset] : params,
  )
  res.json(rows)
})

r.get('/security-events', requirePermission('security.view'), async (req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM security_events
      WHERE ($1 IS NULL OR organization_id = $1)
      ORDER BY occurred_at DESC LIMIT 200`,
    [req.auth.role === 'SUPER_ADMIN' ? null : req.auth.organizationId],
  )
  res.json(rows)
})

// Security endpoints still require authentication even for listing metadata.
r.use(authenticate)

export default r
