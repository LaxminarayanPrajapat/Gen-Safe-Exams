/* PostgreSQL connection pool. */
import pg from 'pg'

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 12,
  idleTimeoutMillis: 30_000,
})
