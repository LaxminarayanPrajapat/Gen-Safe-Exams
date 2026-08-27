/* Auth routes — login, MFA, refresh, logout, password reset. */
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { pool } from '../config/db.js'
import { config } from '../config/env.js'
import { authLimiter } from '../middleware/rate-limit.js'
import { audit } from '../middleware/audit.middleware.js'
import crypto from 'node:crypto'

const r = Router()

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) })

r.post('/login', authLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'VALIDATION', message: 'Invalid credentials format.' })
  const { email, password } = parsed.data

  const { rows } = await pool.query(
    `SELECT u.id, u.password_hash, u.role, u.organization_id, u.status, u.mfa_enabled,
            s.failed_attempts, s.locked_until
       FROM users u LEFT JOIN login_guard s ON s.user_id = u.id
      WHERE u.email = $1 AND u.deleted_at IS NULL`,
    [email],
  )
  const user = rows[0]
  // Uniform failure response — never reveal whether the email exists.
  const fail = async (msg) => {
    await audit(req, user ? 'LOGIN_FAILED' : 'LOGIN_FAILED', 'user', user?.id ?? email, 'FAILURE')
    return res.status(401).json({ error: 'AUTH_FAILED', message: msg })
  }
  if (!user) return fail('Invalid email or password.')
  if (user.locked_until && user.locked_until > new Date()) {
    return res.status(423).json({ error: 'LOCKED', message: `Account locked until ${user.locked_until.toISOString()}.` })
  }
  if (user.status === 'SUSPENDED') return res.status(403).json({ error: 'SUSPENDED' })

  const ok = await verifyPassword(password, user.password_hash)
  if (!ok) {
    const attempts = (user.failed_attempts ?? 0) + 1
    const lock = attempts >= parseInt(process.env.LOGIN_MAX_ATTEMPTS ?? '5')
      ? `now() + interval '${process.env.LOCKOUT_MINUTES ?? 15} minutes'` : null
    await pool.query(
      `INSERT INTO login_guard (user_id, failed_attempts, locked_until, updated_at)
       VALUES ($1,$2, ${lock ?? 'null'}, now())
       ON CONFLICT (user_id) DO UPDATE SET failed_attempts = $2,
         locked_until = ${lock ?? 'login_guard.locked_until'}, updated_at = now()`,
      [user.id, attempts],
    )
    return fail('Invalid email or password.')
  }

  if (user.mfa_enabled) {
    const challenge = jwt.sign({ sub: user.id, kind: 'mfa' }, config.jwtAccessSecret, { expiresIn: '5m' })
    res.cookie('gse_mfa', challenge, { httpOnly: true, sameSite: 'strict', secure: true })
    // In production an OTP/TOTP is issued here; demo deployments use authenticator apps.
    return res.json({ requiresMfa: true })
  }

  await issueSession(res, user)
})

r.post('/mfa/verify', authLimiter, async (req, res) => {
  try {
    const payload = jwt.verify(req.cookies?.gse_mfa ?? '', config.jwtAccessSecret)
    const valid = await verifyTotp(payload.sub, String(req.body?.code ?? '')) // implement TOTP check
    if (!valid) {
      await audit(req, 'MFA_FAILED', 'user', payload.sub, 'FAILURE')
      return res.status(401).json({ error: 'MFA_INVALID' })
    }
    const { rows } = await pool.query('SELECT id, role, organization_id FROM users WHERE id = $1', [payload.sub])
    await issueSession(res, rows[0], { mfa: true })
  } catch {
    res.clearCookie('gse_mfa')
    res.status(401).json({ error: 'MFA_EXPIRED', message: 'Start again from the sign-in page.' })
  }
})

async function issueSession(res, user, { mfa = false } = {}) {
  const sessionId = crypto.randomUUID()
  await pool.query(
    `INSERT INTO sessions (id, user_id, mfa_verified, ip_address, device_meta, expires_at)
     VALUES ($1,$2,$3,$4,$5, now() + interval '${config.refreshTtl}')`,
    [sessionId, user.id, mfa, null, req_ua()],
  )
  const access = jwt.sign(
    { sub: user.id, role: user.role, org: user.organization_id, sid: sessionId, mfa },
    config.jwtAccessSecret, { expiresIn: config.accessTtl },
  )
  const refresh = jwt.sign({ sub: user.id, sid: sessionId }, config.jwtRefreshSecret, { expiresIn: config.refreshTtl })
  res.cookie('gse_access', access, cookieOpts(15 * 60))
  res.cookie('gse_refresh', refresh, cookieOpts(12 * 3600))
  res.json({ ok: true, role: user.role, organizationId: user.organization_id })
}

function cookieOpts(maxAgeSec) {
  return { httpOnly: true, secure: true, sameSite: 'strict', domain: config.cookieDomain, path: '/', maxAge: maxAgeSec * 1000 }
}
const req_ua = () => globalThis.__req?.headers?.['user-agent'] ?? ''

/* Password hashing uses argon2id or bcrypt — see security/passwords.js */
import { verifyPassword } from '../security/passwords.js'
import { verifyTotp } from '../security/totp.js'

export default r
