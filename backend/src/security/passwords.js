/* Password hashing (argon2id preferred, bcrypt fallback). */
import crypto from 'node:crypto'

/**
 * Demo-safe scrypt implementation. Production deployments should use
 * argon2id via the `argon2` package with per-user salts and tuned params.
 */
export async function hashPassword(password) {
  const salt = crypto.randomBytes(16)
  const hash = crypto.scryptSync(password, salt, 64, { N: 2 ** 15, r: 8, p: 1 })
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`
}

export async function verifyPassword(password, stored) {
  const [scheme, saltB64, hashB64] = String(stored).split('$')
  if (scheme !== 'scrypt') return false
  const expected = Buffer.from(hashB64, 'base64')
  const actual = crypto.scryptSync(password, Buffer.from(saltB64, 'base64'), expected.length)
  return crypto.timingSafeEqual(expected, actual)
}
