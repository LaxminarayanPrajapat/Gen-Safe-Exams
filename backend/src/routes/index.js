/* Route registry — every router applies authenticate() first. */
import { Router } from 'express'
import authRoutes from './auth.routes.js'
import institutionRoutes, { universities as universityRoutes, colleges as collegeRoutes, departments as departmentRoutes, staff as staffRoutes } from './institutions.routes.js'
import syllabusRoutes from './syllabus.routes.js'
import questionRoutes from './questions.routes.js'
import paperRoutes from './papers.routes.js'
import releaseRoutes from './releases.routes.js'
import auditRoutes from './audit.routes.js'
import { authenticate } from '../middleware/auth.middleware.js'

const r = Router()

r.use('/auth', authRoutes)
r.use(authenticate) // everything below requires a valid session
r.use('/universities', universityRoutes)
r.use('/colleges', collegeRoutes)
r.use('/departments', departmentRoutes)
r.use('/staff', staffRoutes)
r.use('/syllabus', syllabusRoutes)
r.use('/questions', questionRoutes)
r.use('/papers', paperRoutes)
r.use('/releases', releaseRoutes)
r.use(['/audit-logs', '/security-events'], auditRoutes)

export default r
