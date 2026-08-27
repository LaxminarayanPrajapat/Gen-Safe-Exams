/* Immutable audit trail writer.
 * Every sensitive handler calls `audit(req, action, target, result, meta)`.
 * Audit rows are append-only: no UPDATE/DELETE grant exists for the app role. */
import { pool } from '../config/db.js'

export async function audit(req, action, targetType, targetId, result = 'SUCCESS', meta = {}) {
  try {
    await pool.query(
      `INSERT INTO audit_logs
         (actor_id, organization_id, actor_role, action, target_type, target_id,
          ip_address, device_meta, result, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        req.auth?.userId ?? null,
        req.auth?.organizationId ?? null,
        req.auth?.role ?? 'ANONYMOUS',
        action, targetType, targetId,
        req.ip, req.headers['user-agent'] ?? '', result,
        meta,
      ],
    )
  } catch (err) {
    // Never break the request because of audit failure — but scream in logs.
    console.error('[audit] FAILED to persist event', { action, err: err.message })
  }
}
