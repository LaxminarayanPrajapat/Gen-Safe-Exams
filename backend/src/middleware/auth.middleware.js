/* JWT authentication middleware.
 * Access tokens are short-lived and delivered via httpOnly secure cookies;
 * refresh rotation happens on /api/auth/refresh. */
import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'
import { pool } from '../config/db.js'

export async function authenticate(req, res, next) {
  try {
    const token = req.cookies?.gse_access
    if (!token) return res.status(401).json({ error: 'AUTH_REQUIRED', message: 'Sign-in required.' })

    const payload = jwt.verify(token, config.jwtAccessSecret)
    // Session revocation check — a revoked session id is immediately unusable.
    const { rows } = await pool.query(
      'SELECT 1 FROM sessions WHERE id = $1 AND revoked_at IS NULL AND expires_at > now()',
      [payload.sid],
    )
    if (rows.length === 0) return res.status(401).json({ error: 'SESSION_INVALID' })

    req.auth = {
      userId: payload.sub,
      role: payload.role,
      organizationId: payload.org,
      sessionId: payload.sid,
      mfaVerified: payload.mfa === true,
    }
    next()
  } catch {
    return res.status(401).json({ error: 'TOKEN_INVALID', message: 'Session expired or invalid.' })
  }
}
