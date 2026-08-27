/* Migration runner — applies db/*.sql in filename order, exactly once each.
 * Applied filenames are recorded in schema_migrations so re-running is safe.
 * Usage: DATABASE_URL=postgres://... node src/scripts/migrate.js
 */
import { readdir, readFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from '../config/db.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = join(__dirname, '..', '..', 'db')

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith('.sql'))
    .sort()

  const { rows } = await pool.query('SELECT filename FROM schema_migrations')
  const applied = new Set(rows.map((r) => r.filename))

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`[migrate] skip  ${file} (already applied)`)
      continue
    }
    const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8')
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file])
      await client.query('COMMIT')
      console.log(`[migrate] apply ${file}`)
    } catch (err) {
      await client.query('ROLLBACK')
      console.error(`[migrate] FAILED ${file}:`, err.message)
      process.exitCode = 1
      break
    } finally {
      client.release()
    }
  }

  await pool.end()
}

main().catch((err) => {
  console.error('[migrate] fatal:', err.message)
  process.exit(1)
})
