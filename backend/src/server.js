/* GEN SAFE EXAM API — entrypoint
 * Security-first Express server. Every route is wrapped with:
 *   authenticate → tenantScope → requirePermission → handler → audit
 */
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from './config/env.js'
import apiRouter from './routes/index.js'
import { errorHandler } from './middleware/error-handler.js'
import { limiter } from './middleware/rate-limit.js'

const app = express()
app.set('trust proxy', 1)

app.use(helmet())                       // secure HTTP headers
app.use(cors({ origin: config.corsOrigin, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())
app.use(limiter)

app.get('/healthz', (_req, res) => res.json({ ok: true, service: 'gen-safe-exam-api' }))

app.use('/api', apiRouter)

app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`[gse] API listening on :${config.port} (${config.env})`)
})
