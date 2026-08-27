import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { RequireAuth } from './guards'

import LoginPage from '@/pages/LoginPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import DashboardPage from '@/pages/DashboardPage'
import InstitutionsPage from '@/pages/institutions/InstitutionsPage'
import UniversitiesPage from '@/pages/institutions/UniversitiesPage'
import CollegesPage from '@/pages/institutions/CollegesPage'
import DepartmentsPage from '@/pages/institutions/DepartmentsPage'
import StaffPage from '@/pages/institutions/StaffPage'
import SubjectsPage from '@/pages/SubjectsPage'
import SyllabusPage from '@/pages/SyllabusPage'
import QuestionBankPage from '@/pages/QuestionBankPage'
import GenerateQuestionsPage from '@/pages/GenerateQuestionsPage'
import QuestionPapersPage from '@/pages/QuestionPapersPage'
import PaperCreatePage from '@/pages/PaperCreatePage'
import PaperDetailPage from '@/pages/PaperDetailPage'
import ApprovalsPage from '@/pages/ApprovalsPage'
import SecureVaultPage from '@/pages/SecureVaultPage'
import ReleasesPage from '@/pages/ReleasesPage'
import SecurityPage from '@/pages/SecurityPage'
import AuditLogPage from '@/pages/AuditLogPage'
import SettingsPage from '@/pages/SettingsPage'
import ProfilePage from '@/pages/ProfilePage'
import ForbiddenPage from '@/pages/ForbiddenPage'
import NotFoundPage from '@/pages/NotFoundPage'
import type { Role } from '@/types'

const ALL: Role[] = ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'UNIVERSITY_EXAM_CONTROLLER', 'COLLEGE_ADMIN', 'COLLEGE_EXAM_OFFICER', 'DEPARTMENT_HEAD', 'DEPARTMENT_STAFF', 'AUDITOR']
const ACADEMIC = ALL.filter(r => r !== 'AUDITOR')
const INSTITUTION_MGMT: Role[] = ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'COLLEGE_ADMIN']
const EXAM_AUTHORITY: Role[] = ['SUPER_ADMIN', 'UNIVERSITY_EXAM_CONTROLLER', 'COLLEGE_EXAM_OFFICER', 'DEPARTMENT_HEAD']
const SECURITY_VIEWERS: Role[] = ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'AUDITOR']

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Authenticated app shell */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/institutions" element={<RequireAuth roles={INSTITUTION_MGMT}><InstitutionsPage /></RequireAuth>} />
          <Route path="/universities" element={<RequireAuth roles={['SUPER_ADMIN']}><UniversitiesPage /></RequireAuth>} />
          <Route path="/colleges" element={<RequireAuth roles={['SUPER_ADMIN', 'UNIVERSITY_ADMIN']}><CollegesPage /></RequireAuth>} />
          <Route path="/departments" element={<RequireAuth roles={[...INSTITUTION_MGMT, 'UNIVERSITY_EXAM_CONTROLLER']}><DepartmentsPage /></RequireAuth>} />
          <Route path="/staff" element={<RequireAuth roles={[...EXAM_AUTHORITY, 'COLLEGE_ADMIN', 'AUDITOR']}><StaffPage /></RequireAuth>} />

          <Route path="/subjects" element={<RequireAuth roles={ACADEMIC}><SubjectsPage /></RequireAuth>} />
          <Route path="/syllabus" element={<RequireAuth roles={['SUPER_ADMIN', 'DEPARTMENT_HEAD', 'DEPARTMENT_STAFF', 'COLLEGE_EXAM_OFFICER']}><SyllabusPage /></RequireAuth>} />

          <Route path="/question-bank" element={<RequireAuth roles={ACADEMIC}><QuestionBankPage /></RequireAuth>} />
          <Route path="/questions/generate" element={<RequireAuth roles={['SUPER_ADMIN', 'DEPARTMENT_HEAD', 'DEPARTMENT_STAFF']}><GenerateQuestionsPage /></RequireAuth>} />

          <Route path="/question-papers" element={<RequireAuth roles={ACADEMIC}><QuestionPapersPage /></RequireAuth>} />
          <Route path="/question-papers/create" element={<RequireAuth roles={['DEPARTMENT_HEAD', 'DEPARTMENT_STAFF', 'SUPER_ADMIN']}><PaperCreatePage /></RequireAuth>} />
          <Route path="/question-papers/:id" element={<RequireAuth roles={ACADEMIC}><PaperDetailPage /></RequireAuth>} />

          <Route path="/approvals" element={<RequireAuth roles={EXAM_AUTHORITY}><ApprovalsPage /></RequireAuth>} />

          <Route path="/secure-vault" element={<RequireAuth roles={[...ACADEMIC, 'AUDITOR']}><SecureVaultPage /></RequireAuth>} />
          <Route path="/releases" element={<RequireAuth roles={['SUPER_ADMIN', 'UNIVERSITY_EXAM_CONTROLLER', 'COLLEGE_EXAM_OFFICER']}><ReleasesPage /></RequireAuth>} />

          <Route path="/security" element={<RequireAuth roles={SECURITY_VIEWERS}><SecurityPage /></RequireAuth>} />
          <Route path="/audit-log" element={<RequireAuth roles={[...EXAM_AUTHORITY, 'UNIVERSITY_ADMIN', 'AUDITOR']}><AuditLogPage /></RequireAuth>} />

          <Route path="/settings" element={<RequireAuth roles={ALL}><SettingsPage /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth roles={ALL}><ProfilePage /></RequireAuth>} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
