/* Vault crypto helpers — envelope encryption for final papers.
 * In production the master key lives in a KMS/HSM; this module
 * wraps AES-256-GCM for the data-encryption-key layer. */
import crypto from 'node:crypto'

export function encryptBuffer(plain, hexKey) {
  const key = Buffer.from(hexKey, 'hex')
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const enc = Buffer.concat([cipher.update(plain), cipher.final()])
  return {
    iv: iv.toString('base64'),
    payload: enc.toString('base64'),
    authTag: cipher.getAuthTag().toString('base64'),
  }
}

export function decryptBuffer({ iv, payload, authTag }, hexKey) {
  const key = Buffer.from(hexKey, 'hex')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'))
  decipher.setAuthTag(Buffer.from(authTag, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(payload, 'base64')), decipher.final()])
}

export function documentHash(buf) {
  return 'sha256:' + crypto.createHash('sha256').update(buf).digest('hex')
}

/** HMAC-based tamper-evident signature over (hash, signer, role, timestamp). */
export function signDocument(hashHex, signerId, role, timestamp, pepper) {
  return crypto.createHmac('sha256', pepper).update(`${hashHex}|${signerId}|${role}|${timestamp}`).digest('hex')
}
