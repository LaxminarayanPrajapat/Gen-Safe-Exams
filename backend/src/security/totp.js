/* RFC-6238 TOTP verification for MFA. */
import crypto from 'node:crypto'

export function verifyTotp(_userId, code, secretBase32 = process.env.DEMO_TOTP_SECRET ?? '', window = 1) {
  if (!secretBase32 || !/^\d{6}$/.test(code)) return false
  const counter = Math.floor(Date.now() / 30_000)
  for (let i = -window; i <= window; i++) {
    if (totpAt(counter + i, secretBase32) === code) return true
  }
  return false
}

function totpAt(counter, secretBase32) {
  const key = base32Decode(secretBase32)
  const buf = Buffer.alloc(8)
  buf.writeUInt32BE(Math.floor(counter / 2 ** 32), 0)
  buf.writeUInt32BE(counter >>> 0, 4)
  const hmac = crypto.createHmac('sha1', key).update(buf).digest()
  const offset = hmac[hmac.length - 1] & 0xf
  const bin =
    ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) | hmac[offset + 3]
  return String(bin % 1_000_000).padStart(6, '0')
}

function base32Decode(input) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = ''
  for (const c of input.toUpperCase().replaceAll('=', '')) bits += alphabet.indexOf(c).toString(2).padStart(5, '0')
  const bytes = []
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2))
  return Buffer.from(bytes)
}
