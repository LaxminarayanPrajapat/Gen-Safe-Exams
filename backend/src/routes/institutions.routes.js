/* Institution hierarchy routes — universities, colleges, departments, staff.
 * Every handler is tenant-scoped: queries filter by req.auth.organizationId
 * unless the actor is SUPER_ADMIN with an explicit audited context. */
import { Router } from 'express'
import { z } from 'zod'
import { pool } from '../config/db.js'
import { requirePermission } from '../middleware/rbac.middleware.js'
import { audit } from '../middleware/audit.middleware.js'

const r = Router()

/* ---------- Universities (Super Admin only) ---------- */
export const universities = Router()

const univSchema = z.object({
  name: z.string().min(3).max(200),
  code: z.string().min(2).max(12),
  location: z.string().max(120),
  adminEmail: z.string().email(),
})

universities.post('/',
  requirePermission('university.register'),
  async (req, res) => {
    const p = univSchema.safeParse(req.body)
    if (!p.success) return res.status(400).json({ error: 'VALIDATION', issues: p.error.issues })
    const { rows } = await pool.query(
      `INSERT INTO universities (name, code, location, status)
       VALUES ($1,$2,$3,'PENDING_APPROVAL') RETURNING *`,
      [p.data.name, p.data.code.toUpperCase(), p.data.location],
    )
    await audit(req, 'UNIVERSITY_REGISTERED', 'university', rows[0].id)
    res.status(201).json(rows[0])
  })

universities.get('/', requirePermission('university.view'), async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM universities WHERE deleted_at IS NULL ORDER BY name')
  res.json(rows)
})

universities.post('/:id/approve', requirePermission('university.approve'), async (req, res) => {
  await pool.query(`UPDATE universities SET status='ACTIVE' WHERE id=$1`, [req.params.id])
  await audit(req, 'UNIVERSITY_APPROVED', 'university', req.params.id)
  res.json({ ok: true })
})

/* ---------- Colleges ---------- */
export const colleges = Router()
colleges.post('/', requirePermission('college.register'), async (req, res) => {
  const { rows } = await pool.query(
    `INSERT INTO colleges (university_id, name, code, location, status)
     VALUES ($1,$2,$3,$4,'PENDING_APPROVAL') RETURNING *`,
    [req.auth.organizationId, req.body.name, String(req.body.code).toUpperCase(), req.body.location],
  )
  await audit(req, 'COLLEGE_REGISTERED', 'college', rows[0].id)
  res.status(201).json(rows[0])
})
colleges.get('/', async (req, res) => {
  // Tenant scope enforced in SQL — a university admin can never list another university's colleges.
  const scope = req.auth.role === 'SUPER_ADMIN' ? '' : 'WHERE university_id = $1'
  const { rows } = await pool.query(`SELECT * FROM colleges ${scope} ORDER BY name`, [req.auth.organizationId])
  res.json(rows)
})

/* ---------- Departments & staff ---------- */
export const departments = Router()
departments.post('/', requirePermission('department.create'), async (req, res) => {
  const { rows } = await pool.query(
    `INSERT INTO departments (college_id, name, code, verification_status)
     VALUES ($1,$2,$3,'UNDER_REVIEW') RETURNING *`,
    [req.auth.organizationId, req.body.name, String(req.body.code).toUpperCase()],
  )
  await audit(req, 'DEPARTMENT_CREATED', 'department', rows[0].id)
  res.status(201).json(rows[0])
})
departments.get('/', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT d.* FROM departments d JOIN colleges c ON c.id = d.college_id
      WHERE ($1 = ANY($2) OR c.university_id = $3 OR d.college_id = $4 OR d.id = $5)`,
    [req.auth.userId,
      req.auth.role === 'SUPER_ADMIN' ? ['*'] : [],
      req.auth.role === 'UNIVERSITY_ADMIN' ? req.auth.organizationId : null,
      req.auth.role === 'COLLEGE_ADMIN' ? req.auth.organizationId : null,
      req.auth.role.startsWith('DEPARTMENT') ? req.auth.organizationId : null],
  )
  res.json(rows)
})

export const staff = Router()
staff.post('/invite', requirePermission('staff.invite'), async (req, res) => {
  const token = crypto.randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase()
  const { rows } = await pool.query(
    `INSERT INTO staff_invitations (email, department_id, designation, token, invited_by, expires_at)
     VALUES ($1,$2,$3,$4,$5, now() + interval '72 hours') RETURNING id`,
    [req.body.email.toLowerCase(), req.body.departmentId ?? req.auth.organizationId, req.body.designation, token, req.auth.userId],
  )
  await audit(req, 'STAFF_INVITED', 'staff_invitation', rows[0].id, 'SUCCESS', { email: req.body.email })
  // Outbox pattern: a worker delivers the official email; API never blocks on SMTP.
  res.status(201).json({ invitationId: rows[0].id, expiresInSeconds: 72 * 3600 })
})

import crypto from 'node:crypto'

staff.post('/verify', requirePermission('staff.verify'), async (req, res) => {
  const { userId, decision } = req.body
  if (!['VERIFIED', 'REJECTED'].includes(decision)) return res.status(400).json({ error: 'VALIDATION' })
  await pool.query(
    `UPDATE users SET status = $2 WHERE id = $1 AND organization_id = $3`,
    [userId, decision === 'VERIFIED' ? 'ACTIVE' : 'SUSPENDED', req.auth.organizationId],
  )
  await audit(req, decision === 'VERIFIED' ? 'STAFF_VERIFIED' : 'STAFF_REJECTED', 'user', userId)
  res.json({ ok: true })
})

export default r
