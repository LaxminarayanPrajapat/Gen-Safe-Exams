/* ============================================================
   GEN SAFE EXAM — Core domain types
   ============================================================ */

export type Role =
  | 'SUPER_ADMIN'
  | 'UNIVERSITY_ADMIN'
  | 'UNIVERSITY_EXAM_CONTROLLER'
  | 'COLLEGE_ADMIN'
  | 'COLLEGE_EXAM_OFFICER'
  | 'DEPARTMENT_HEAD'
  | 'DEPARTMENT_STAFF'
  | 'AUDITOR'

export type Permission =
  | 'platform.manage'
  | 'university.register' | 'university.approve' | 'university.suspend' | 'university.view'
  | 'college.register' | 'college.approve' | 'college.suspend' | 'college.view'
  | 'department.create' | 'department.view'
  | 'staff.invite' | 'staff.verify' | 'staff.view'
  | 'subject.manage' | 'subject.view'
  | 'syllabus.upload' | 'syllabus.approve' | 'syllabus.view'
  | 'question.generate' | 'question.approve' | 'question.reject' | 'question.view'
  | 'blueprint.manage'
  | 'paper.create' | 'paper.submit' | 'paper.review.department' | 'paper.review.college'
  | 'paper.approve.university' | 'paper.view' | 'paper.download'
  | 'vault.access' | 'release.schedule' | 'release.activate'
  | 'audit.view' | 'security.view'
  | 'settings.manage'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  title: string
  organizationId: string        // tenant scope: university / college / department id
  organizationName: string
  mfaEnabled: boolean
  status: AccountStatus
  lastLoginAt?: string
}

export type AccountStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'LOCKED'

export type VerificationStatus =
  | 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED' | 'EXPIRED' | 'REVOKED'

export type OrgStatus = 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED'

/* ---------- Institutions ---------- */
export interface University {
  id: string
  name: string
  code: string
  location: string
  adminName: string
  adminEmail: string
  status: OrgStatus
  establishedYear: number
  createdAt: string
}

export interface College {
  id: string
  universityId: string
  universityName: string
  name: string
  code: string
  location: string
  adminName: string
  adminEmail: string
  status: OrgStatus
  createdAt: string
}

export interface Department {
  id: string
  collegeId: string
  collegeName: string
  universityId: string
  name: string
  code: string
  hodName?: string
  hodEmail?: string
  staffCount: number
  verificationStatus: VerificationStatus
  createdAt: string
}

export interface StaffMember {
  id: string
  name: string
  email: string
  departmentId: string
  departmentName: string
  designation: string
  role: Role
  verificationStatus: VerificationStatus
  invitedBy: string
  invitedAt: string
  verifiedBy?: string
  verifiedAt?: string
  employeeId: string
}

/* ---------- Subjects & syllabus ---------- */
export interface Subject {
  id: string
  code: string
  name: string
  departmentId: string
  departmentName: string
  course: string
  semester: number
  academicYear: string
  credits: number
  syllabusStatus: 'NOT_UPLOADED' | 'DRAFT' | 'AI_EXTRACTED' | 'APPROVED'
  questionCount: number
  assignedTo?: string
}

export interface SyllabusUnit {
  id: string
  number: number
  title: string
  hours: number
  weightage: number
  topics: SyllabusTopic[]
}

export interface SyllabusTopic {
  id: string
  title: string
  subtopics: string[]
  learningOutcomes: string[]
}

export interface Syllabus {
  id: string
  subjectId: string
  subjectCode: string
  version: number
  status: Subject['syllabusStatus']
  sourceFile?: string
  extractedAt?: string
  approvedBy?: string
  units: SyllabusUnit[]
}

/* ---------- Questions ---------- */
export type QuestionType =
  | 'MCQ' | 'TRUE_FALSE' | 'FILL_BLANK' | 'SHORT_ANSWER' | 'DESCRIPTIVE'
  | 'NUMERICAL' | 'PROGRAMMING' | 'CASE_STUDY' | 'PROBLEM_SOLVING' | 'PRACTICAL'

export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type BloomLevel = 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create'

export interface Question {
  id: string
  subjectId: string
  subjectCode: string
  unit: number
  unitTitle: string
  topic: string
  text: string
  type: QuestionType
  difficulty: Difficulty
  bloom: BloomLevel
  marks: number
  learningOutcome: string
  referenceAnswer: string
  aiGenerated: boolean
  status: 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED'
  createdBy: string
  reviewedBy?: string
  createdAt: string
  version: number
  duplicateScore: number       // 0..1 semantic similarity vs bank (1 = exact dup)
  validationScore: number      // 0..100 automated checks result
  usageCount: number
}

/* ---------- Blueprint & papers ---------- */
export interface SectionSpec {
  id: string
  name: string                    // "Section A"
  instruction: string
  questionCount: number
  marksPerQuestion: number
  totalMarks: number
  types: QuestionType[]
  choiceStructure?: string        // e.g. "Answer any 5 of 7"
}

export interface DifficultySplit { Easy: number; Medium: number; Hard: number }
export interface BloomSplit extends Partial<Record<BloomLevel, number>> {}

export interface ExamBlueprint {
  id: string
  subjectId: string
  subjectCode: string
  title: string
  totalMarks: number
  durationMinutes: number
  sections: SectionSpec[]
  difficultyDistribution: DifficultySplit // percentages
  bloomDistribution: Record<string, number>
  unitWeightage: Record<number, number>
  createdAt: string
  createdBy: string
}

export type PaperStatus =
  | 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'CHANGES_REQUESTED'
  | 'APPROVED' | 'IN_VAULT' | 'RELEASED' | 'ARCHIVED' | 'REJECTED'

export interface PaperSet {
  label: string                   // A / B / C / D
  questions: PaperQuestionRef[]
  equivalenceGroup: string
}

export interface PaperQuestionRef {
  questionId: string
  order: number
  section: string
  marks: number
}

export interface ApprovalEntry {
  approvalId: string
  stage: 'STAFF_SUBMISSION' | 'DEPARTMENT_HEAD_REVIEW' | 'COLLEGE_REVIEW' | 'UNIVERSITY_APPROVAL'
  actorName: string
  actorRole: Role
  decision: 'APPROVED' | 'REJECTED' | 'SUBMITTED' | 'CHANGES_REQUESTED'
  comment?: string
  timestamp: string
}

export interface QuestionPaper {
  id: string
  code: string
  title: string
  subjectId: string
  subjectCode: string
  blueprintId: string
  examDate: string
  durationMinutes: number
  totalMarks: number
  sets: PaperSet[]
  status: PaperStatus
  currentVersion: number
  versions: PaperVersion[]
  qualitySummary: QualitySummary
  approvals: ApprovalEntry[]
  createdBy: string
  createdAt: string
  updatedAt: string
  vault?: VaultRecord
}

export interface PaperVersion {
  version: number
  label: string                  // Draft / Version 1 / Final
  changedBy: string
  changedAt: string
  reason: string
}

export interface QualitySummary {
  syllabusCoveragePct: number
  difficultyDistribution: DifficultySplit
  bloomDistribution: Record<string, number>
  unitDistribution: Record<number, number>
  duplicateScore: number          // lower is better
  validationScore: number         // 0..100
  setEquivalenceScore: number
}

export interface VaultRecord {
  vaultedAt: string
  encryption: string              // AES-256-GCM
  documentHash: string            // SHA-256
  signedBy?: string
  signedAt?: string
  accessLogCount: number
  releaseLocked: boolean
}

/* ---------- Releases ---------- */
export interface PaperRelease {
  id: string
  paperId: string
  paperCode: string
  setTitle: string
  examDate: string
  examTime: string
  releaseAt: string               // scheduled unlock time
  status: 'SCHEDULED' | 'ACTIVE' | 'DELIVERED' | 'EXPIRED' | 'REVOKED'
  deliveredTo: string
  activatedBy?: string
  activatedAt?: string
}

/* ---------- Audit & security ---------- */
export type AuditAction =
  | 'USER_LOGIN' | 'LOGIN_FAILED' | 'MFA_SUCCESS' | 'ACCOUNT_LOCKED'
  | 'UNIVERSITY_REGISTERED' | 'COLLEGE_REGISTERED' | 'DEPARTMENT_CREATED'
  | 'STAFF_INVITED' | 'STAFF_REGISTERED' | 'STAFF_VERIFIED' | 'STAFF_REJECTED'
  | 'SYLLABUS_UPLOADED' | 'SYLLABUS_APPROVED'
  | 'QUESTION_GENERATED' | 'QUESTION_APPROVED' | 'QUESTION_REJECTED'
  | 'BLUEPRINT_CREATED' | 'PAPER_CREATED' | 'PAPER_VIEWED' | 'PAPER_DOWNLOADED'
  | 'PAPER_SUBMITTED' | 'PAPER_APPROVED' | 'PAPER_REJECTED'
  | 'VAULT_ACCESS' | 'PAPER_RELEASED' | 'PAPER_ACCESS_DENIED'
  | 'SECURITY_ALERT' | 'SESSION_REVOKED' | 'SETTINGS_CHANGED'
  | 'AUDIT_EXPORTED' | 'PASSWORD_CHANGED'

export interface AuditEvent {
  id: string
  actorId: string
  actorName: string
  actorRole: Role
  organizationId: string
  organizationName: string
  action: AuditAction
  targetType: string
  targetId: string
  timestamp: string
  ip: string
  device: string
  result: 'SUCCESS' | 'FAILURE' | 'DENIED'
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface SecurityEvent {
  id: string
  type: string
  description: string
  riskLevel: RiskLevel
  actorName: string
  ip: string
  timestamp: string
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED'
  relatedEntity?: string
}

export interface ActiveSession {
  id: string
  userName: string
  role: Role
  device: string
  ip: string
  startedAt: string
  lastActiveAt: string
  mfa: boolean
  current?: boolean
}

/* ---------- Notifications ---------- */
export interface AppNotification {
  id: string
  title: string
  body: string
  time: string
  kind: 'approval' | 'security' | 'system' | 'syllabus'
  read: boolean
}
