/* Role-based access control + permission authorization.
 * The React app hides UI; THIS layer is the real enforcement point. */
const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['*'],
  UNIVERSITY_ADMIN: [
    'college.register', 'college.approve', 'college.suspend', 'college.view',
    'department.create', 'department.view', 'staff.view', 'university.view',
    'subject.view', 'question.view', 'paper.view', 'audit.view', 'security.view',
  ],
  UNIVERSITY_EXAM_CONTROLLER: [
    'paper.approve.university', 'paper.review.college', 'paper.view', 'paper.download',
    'release.schedule', 'release.activate', 'vault.access', 'audit.view', 'security.view',
    'department.view', 'staff.view', 'question.view', 'syllabus.view',
  ],
  COLLEGE_ADMIN: [
    'department.create', 'department.view', 'staff.invite', 'staff.view',
    'paper.view', 'question.view', 'university.view',
  ],
  COLLEGE_EXAM_OFFICER: [
    'paper.review.college', 'paper.view', 'question.view', 'release.schedule',
    'vault.access', 'audit.view', 'staff.view', 'syllabus.view', 'department.view',
  ],
  DEPARTMENT_HEAD: [
    'staff.verify', 'staff.invite', 'staff.view', 'subject.manage', 'syllabus.upload',
    'syllabus.approve', 'syllabus.view', 'question.generate', 'question.approve',
    'question.reject', 'question.view', 'blueprint.manage', 'paper.create', 'paper.submit',
    'paper.review.department', 'paper.view', 'audit.view', 'release.schedule',
  ],
  DEPARTMENT_STAFF: [
    'syllabus.upload', 'syllabus.view', 'question.generate', 'question.view',
    'blueprint.manage', 'paper.create', 'paper.submit', 'paper.view', 'subject.view',
  ],
  AUDITOR: ['audit.view', 'security.view', 'paper.view.metadata'],
}

export const can = (role, permission) =>
  (ROLE_PERMISSIONS[role] ?? []).includes('*') || (ROLE_PERMISSIONS[role] ?? []).includes(permission)

export function requirePermission(permission) {
  return (req, res, next) => {
    if (!can(req.auth?.role, permission)) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: `Role ${req.auth?.role} lacks permission '${permission}'.`,
        requiredPermission: permission,
      })
    }
    next()
  }
}

export const permissionsOf = (role) => ROLE_PERMISSIONS[role] ?? []
