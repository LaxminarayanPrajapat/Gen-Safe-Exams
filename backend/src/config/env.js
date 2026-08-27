/* Environment configuration — fail fast on missing secrets. */
const required = (name) => {
  const v = process.env[name]
  if (!v && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required env var: ${name}`)
  }
  return v ?? `dev-${name.toLowerCase()}`
}

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  databaseUrl: required('DATABASE_URL'),
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET'),
  accessTtl: process.env.ACCESS_TOKEN_TTL ?? '15m',
  refreshTtl: process.env.REFRESH_TOKEN_TTL ?? '12h',
  cookieDomain: process.env.COOKIE_DOMAIN,
  vaultEncKey: required('VAULT_ENC_KEY'),
  aiProvider: process.env.AI_PROVIDER ?? 'openai',
  corsOrigin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173'],
}
