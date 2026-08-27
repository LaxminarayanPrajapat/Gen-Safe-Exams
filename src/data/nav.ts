import type { Role } from '@/types'

/* ============================================================
   GEN SAFE EXAM — Navigation model + role visibility
   ============================================================ */

export interface NavItem {
  label: string
  to: string
  icon: string            // lucide icon key, resolved in Sidebar
  roles: Role[]           // roles that can see this item
  badgeKey?: 'approvals' | 'security'
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

const ALL: Role[] = ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'UNIVERSITY_EXAM_CONTROLLER', 'COLLEGE_ADMIN', 'COLLEGE_EXAM_OFFICER', 'DEPARTMENT_HEAD', 'DEPARTMENT_STAFF', 'AUDITOR']
const ACADEMIC: Role[] = ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'UNIVERSITY_EXAM_CONTROLLER', 'COLLEGE_ADMIN', 'COLLEGE_EXAM_OFFICER', 'DEPARTMENT_HEAD', 'DEPARTMENT_STAFF']
const INSTITUTION: Role[] = ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'COLLEGE_ADMIN']
const EXAM_AUTHORITY: Role[] = ['SUPER_ADMIN', 'UNIVERSITY_EXAM_CONTROLLER', 'COLLEGE_EXAM_OFFICER', 'DEPARTMENT_HEAD']

export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', to: '/dashboard', icon: 'LayoutDashboard', roles: ALL }],
  },
  {
    label: 'Institutions',
    items: [
      { label: 'Hierarchy', to: '/institutions', icon: 'Network', roles: INSTITUTION },
      { label: 'Universities', to: '/universities', icon: 'Landmark', roles: ['SUPER_ADMIN'] },
      { label: 'Colleges', to: '/colleges', icon: 'Building2', roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN'] },
      { label: 'Departments', to: '/departments', icon: 'GitBranch', roles: [...INSTITUTION, 'UNIVERSITY_EXAM_CONTROLLER'] },
      { label: 'Staff', to: '/staff', icon: 'Users', roles: [...EXAM_AUTHORITY, 'AUDITOR'] },
    ],
  },
  {
    label: 'Academics',
    items: [
      { label: 'Subjects', to: '/subjects', icon: 'BookOpen', roles: ACADEMIC },
      { label: 'Syllabus', to: '/syllabus', icon: 'FileText', roles: ACADEMIC },
    ],
  },
  {
    label: 'Examination',
    items: [
      { label: 'Question Bank', to: '/question-bank', icon: 'Database', roles: ACADEMIC },
      { label: 'Generate Questions', to: '/questions/generate', icon: 'Sparkles', roles: ['SUPER_ADMIN', 'DEPARTMENT_HEAD', 'DEPARTMENT_STAFF'] },
      { label: 'Question Papers', to: '/question-papers', icon: 'FileStack', roles: ACADEMIC },
      { label: 'Approvals', to: '/approvals', icon: 'CheckCircle2', roles: EXAM_AUTHORITY, badgeKey: 'approvals' },
    ],
  },
  {
    label: 'Security & Release',
    items: [
      { label: 'Secure Vault', to: '/secure-vault', icon: 'Lock', roles: [...ACADEMIC, 'AUDITOR'] },
      { label: 'Releases', to: '/releases', icon: 'CalendarClock', roles: ['SUPER_ADMIN', 'UNIVERSITY_EXAM_CONTROLLER', 'COLLEGE_EXAM_OFFICER'] },
      { label: 'Security', to: '/security', icon: 'ShieldCheck', roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'AUDITOR'], badgeKey: 'security' },
      { label: 'Audit Log', to: '/audit-log', icon: 'ScrollText', roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'UNIVERSITY_EXAM_CONTROLLER', 'COLLEGE_EXAM_OFFICER', 'DEPARTMENT_HEAD', 'AUDITOR'] },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', to: '/settings', icon: 'Settings', roles: ALL },
      { label: 'Profile', to: '/profile', icon: 'UserCircle2', roles: ALL },
    ],
  },
]

/* ---------- Route access map (mirrors backend middleware) ---------- */
export const routeRoles: Record<string, Role[]> = {
  '/universities': ['SUPER_ADMIN'],
  '/colleges': ['SUPER_ADMIN', 'UNIVERSITY_ADMIN'],
  '/departments': ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'UNIVERSITY_EXAM_CONTROLLER', 'COLLEGE_ADMIN'],
  '/staff': ['SUPER_ADMIN', 'UNIVERSITY_EXAM_CONTROLLER', 'COLLEGE_EXAM_OFFICER', 'DEPARTMENT_HEAD', 'COLLEGE_ADMIN', 'AUDITOR'],
  '/institutions': ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'COLLEGE_ADMIN'],
  '/subjects': ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'UNIVERSITY_EXAM_CONTROLLER', 'COLLEGE_ADMIN', 'COLLEGE_EXAM_OFFICER', 'DEPARTMENT_HEAD', 'DEPARTMENT_STAFF'],
  '/syllabus': ['SUPER_ADMIN', 'DEPARTMENT_HEAD', 'DEPARTMENT_STAFF', 'COLLEGE_EXAM_OFFICER'],
  '/question-bank': ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'UNIVERSITY_EXAM_CONTROLLER', 'COLLEGE_ADMIN', 'COLLEGE_EXAM_OFFICER', 'DEPARTMENT_HEAD', 'DEPARTMENT_STAFF'],
  '/questions/generate': ['SUPER_ADMIN', 'DEPARTMENT_HEAD', 'DEPARTMENT_STAFF'],
  '/question-papers': ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'UNIVERSITY_EXAM_CONTROLLER', 'COLLEGE_ADMIN', 'COLLEGE_EXAM_OFFICER', 'DEPARTMENT_HEAD', 'DEPARTMENT_STAFF'],
  '/approvals': ['SUPER_ADMIN', 'UNIVERSITY_EXAM_CONTROLLER', 'COLLEGE_EXAM_OFFICER', 'DEPARTMENT_HEAD'],
  '/secure-vault': ['SUPER_ADMIN', 'UNIVERSITY_EXAM_CONTROLLER', 'COLLEGE_EXAM_OFFICER', 'DEPARTMENT_HEAD', 'DEPARTMENT_STAFF', 'AUDITOR'],
  '/releases': ['SUPER_ADMIN', 'UNIVERSITY_EXAM_CONTROLLER', 'COLLEGE_EXAM_OFFICER'],
  '/security': ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'AUDITOR'],
  '/audit-log': ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'UNIVERSITY_EXAM_CONTROLLER', 'COLLEGE_EXAM_OFFICER', 'DEPARTMENT_HEAD', 'AUDITOR'],
}

export const roleLabel: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  UNIVERSITY_ADMIN: 'University Admin',
  UNIVERSITY_EXAM_CONTROLLER: 'University Exam Controller',
  COLLEGE_ADMIN: 'College Admin',
  COLLEGE_EXAM_OFFICER: 'College Exam Officer',
  DEPARTMENT_HEAD: 'Department Head',
  DEPARTMENT_STAFF: 'Department Staff',
  AUDITOR: 'Auditor',
}
