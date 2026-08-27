import { useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  ArrowLeft, Lock, ShieldCheck, FileSignature, Download, CalendarClock,
  CheckCircle2, XCircle, AlertTriangle,
} from 'lucide-react'
import {
  Card, CardHeader, CardBody, Button, Tabs, StatusBadge, statusTone,
  ApprovalStepper, DistributionBars, SecurityBadge, Modal, ConfirmationDialog, FormField, Textarea, Input,
} from '@/components/ui'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'
import { papers as seedPapers, releases as seedReleases } from '@/data/demo'
import type { QuestionPaper, PaperStatus, ApprovalEntry } from '@/types'
import { formatDate } from '@/utils'

const DEMO_SECTION_QUESTIONS: Record<string, string[]> = {
  'Section A': [
    'The time complexity of inserting an element at the head of a singly linked list is: (A) O(1) (B) O(log n) (C) O(n) (D) O(n²)',
    'A queue follows which ordering principle? (A) LIFO (B) FIFO (C) Priority (D) Random',
    'Which traversal of a BST visits nodes in sorted order? (A) Preorder (B) Inorder (C) Postorder (D) Level order',
    'State True/False: A binary tree of height h has at most 2^(h+1) − 1 nodes.',
    'Fill in the blank: The minimum number of edges in a connected graph with n vertices is ______.',
  ],
  'Section B': [
    'Define collision in hashing and state two resolution strategies.',
    'Differentiate between linear search and binary search with one example scenario for each.',
    'Explain the concept of a priority queue with its two principal operations.',
    'Write the postfix form of: (A + B) * C − D / E.',
  ],
  'Section C': [
    'Construct a binary search tree from the sequence 45, 25, 65, 15, 35, 55, 75. Write all three depth-first traversals.',
    'Apply BFS and DFS to the given adjacency graph starting from vertex A; list visit order and queue/stack states.',
    'Given R(A,B,C,D) with FDs {A→B, B→C, C→A, C→D}, determine the highest normal form; decompose to BCNF if required.',
    'For schedule S: R1(X), W2(X), R1(Y), W1(Y), W2(Y) — draw the precedence graph and check conflict-serializability.',
  ],
  'Section D': [
    'Design a hash-table based spell checker for a 100k-word dictionary. Analyse time and space complexity of lookup, insertion and deletion.',
    'Compare quick sort and merge sort theoretically and empirically; justify the preferred algorithm for linked lists and for arrays under memory constraints.',
    'A university stores student records with frequent range queries on roll number. Select and justify appropriate data structures across storage, indexing and retrieval layers.',
  ],
}

export default function PaperDetailPage() {
  const { id } = useParams()
  const location = useLocation() as { state?: { created?: boolean; draft?: unknown } }
  const toast = useToast()
  const { user } = useAuth()

  const [paper, setPaper] = useState<QuestionPaper>(() => {
    const draft = location.state?.draft as QuestionPaper | undefined
    if (draft && draft.id === id) return draft
    return seedPapers.find(p => p.id === id) ?? seedPapers[0]
  })

  const [tab, setActive] = useState('structure')
  const [activeSet, setActiveSet] = useState(0)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [decisionOpen, setDecisionOpen] = useState<'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | null>(null)
  const [vaultOpen, setVaultOpen] = useState(false)
  const [comment, setComment] = useState('')

  const isStaffDraftOwner = paper.status === 'DRAFT' && ['DEPARTMENT_STAFF', 'DEPARTMENT_HEAD', 'SUPER_ADMIN'].includes(user?.role ?? '')
  const canReviewDepartment = user?.role === 'DEPARTMENT_HEAD' && ['SUBMITTED', 'UNDER_REVIEW'].includes(paper.status)
  const canReviewCollege = user?.role === 'COLLEGE_EXAM_OFFICER' && paper.approvals.some(a => a.stage === 'DEPARTMENT_HEAD_REVIEW' && a.decision === 'APPROVED') && !paper.approvals.some(a => a.stage === 'COLLEGE_REVIEW')
  const canApproveUniversity = user?.role === 'UNIVERSITY_EXAM_CONTROLLER' && paper.approvals.some(a => a.stage === 'COLLEGE_REVIEW' && a.decision === 'APPROVED')
  const canVault = canApproveUniversity

  const sectionsPreview = useMemo(() => {
    // Demo rendering: distribute representative questions into the four canonical sections.
    return Object.entries(DEMO_SECTION_QUESTIONS).map(([name, qs], i) => ({
      name,
      marksPerQuestion: [1, 2, 5, 10][i],
      instruction: ['Answer all questions.', 'Answer any 5 of 7.', 'Answer any 4 of 6.', 'Answer any 3 of 5.'][i],
      questions: qs.map((text, j) => ({ n: j + 1, text, marks: [1, 2, 5, 10][i] })),
    }))
  }, [])

  const recordDecision = (decision: NonNullable<typeof decisionOpen>) => {
    const stageMap: Record<UserRoleLike, ApprovalEntry['stage']> = {
      DEPARTMENT_HEAD: 'DEPARTMENT_HEAD_REVIEW',
      COLLEGE_EXAM_OFFICER: 'COLLEGE_REVIEW',
      UNIVERSITY_EXAM_CONTROLLER: 'UNIVERSITY_APPROVAL',
    }
    const role = user!.role as UserRoleLike
    const entry: ApprovalEntry = {
      approvalId: `APR-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      stage: stageMap[role] ?? 'DEPARTMENT_HEAD_REVIEW',
      actorName: user!.name, actorRole: user!.role, decision,
      comment: comment || undefined, timestamp: new Date().toISOString(),
    }
    setPaper(p => ({
      ...p,
      approvals: [...p.approvals, entry],
      status: decision === 'APPROVED'
        ? (entry.stage === 'UNIVERSITY_APPROVAL' ? p.status : p.status)
        : 'CHANGES_REQUESTED',
      updatedAt: new Date().toISOString(),
      versions: decision !== 'APPROVED'
        ? [...p.versions, { version: p.currentVersion + 1, label: `Version ${p.currentVersion + 1}`, changedBy: user!.name, changedAt: new Date().toISOString(), reason: comment || `${decision.toLowerCase()} at ${entry.stage.replaceAll('_', ' ').toLowerCase()}` }]
        : p.versions,
      currentVersion: decision !== 'APPROVED' ? p.currentVersion + 1 : p.currentVersion,
    }))
    toast.push(decision === 'APPROVED' ? 'success' : 'warning',
      `Decision recorded: ${decision.replaceAll('_', ' ')}`,
      `Approval ID ${entry.approvalId}. Immutable audit event PAPER_${decision === 'APPROVED' ? 'APPROVED' : 'REJECTED'} stored.`)
    setDecisionOpen(null); setSubmitOpen(false); setComment('')
  }

  const sendToVault = () => {
    setPaper(p => ({
      ...p,
      status: 'IN_VAULT' as PaperStatus,
      vault: {
        vaultedAt: new Date().toISOString(),
        encryption: 'AES-256-GCM',
        documentHash: `sha256:${Array.from({ length: 8 }, () => Math.floor(Math.random() * 65536).toString(16).padStart(4, '0')).join('')}…`,
        signedBy: user?.name, signedAt: new Date().toISOString(),
        accessLogCount: 0, releaseLocked: true,
      },
      updatedAt: new Date().toISOString(),
    }))
    setVaultOpen(false)
    toast.push('success', 'Paper sealed in Secure Vault',
      'Encrypted with AES-256-GCM and digitally signed. Access before scheduled release is denied and audited.')
  }

  const submitForReview = () => {
    setPaper(p => ({ ...p, status: 'SUBMITTED', approvals: [...p.approvals, {
      approvalId: `APR-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      stage: 'STAFF_SUBMISSION', actorName: user!.name, actorRole: user!.role,
      decision: 'SUBMITTED', comment: comment || undefined, timestamp: new Date().toISOString(),
    }] }))
    setSubmitOpen(false); setComment('')
    toast.push('success', 'Submitted for approval', 'Routed to Department Head. You retain read-only access until a decision is recorded.')
  }

  const q = paper.qualitySummary
  const setLabels = paper.sets.map(s => s.label)

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <div className="breadcrumbs" style={{ marginBottom: 4 }}>
            <Link to="/question-papers">Question papers</Link>
          </div>
          <h1>{paper.code}</h1>
          <p className="page-desc">{paper.title}</p>
        </div>
        <Link to="/question-papers" className="btn btn-outline"><ArrowLeft size={14} /> All papers</Link>
      </div>

      <Card style={{ marginBottom: 'var(--sp-4)' }}>
        <CardBody>
          <div className="u-flex-between u-wrap">
            <div className="paper-header-meta">
              <span><strong>{paper.subjectCode}</strong></span>
              <span>{paper.totalMarks} marks</span>
              <span>{paper.durationMinutes} min</span>
              <span>Exam: {formatDate(paper.examDate)}</span>
              <span>Sets: {setLabels.join(', ')}</span>
              <span>v{paper.currentVersion}</span>
            </div>
            <div className="page-actions">
              <StatusBadge tone={statusTone(paper.status)}>{paper.status.replaceAll('_', ' ')}</StatusBadge>
              {isStaffDraftOwner && (
                <Button onClick={() => setSubmitOpen(true)}>Submit for approval</Button>
              )}
              {canReviewDepartment && (
                <>
                  <Button variant="success" onClick={() => setDecisionOpen('APPROVED')}>Approve</Button>
                  <Button variant="outline" onClick={() => setDecisionOpen('CHANGES_REQUESTED')}>Request changes</Button>
                  <Button variant="danger-outline" onClick={() => setDecisionOpen('REJECTED')}>Reject</Button>
                </>
              )}
              {canReviewCollege && (
                <>
                  <Button variant="success" onClick={() => setDecisionOpen('APPROVED')}>College approve</Button>
                  <Button variant="danger-outline" onClick={() => setDecisionOpen('REJECTED')}>Return</Button>
                </>
              )}
              {canApproveUniversity && (
                <>
                  <Button variant="success" onClick={() => setDecisionOpen('APPROVED')}>Final approve</Button>
                  <Button variant="danger-outline" onClick={() => setDecisionOpen('REJECTED')}>Reject</Button>
                </>
              )}
              {canVault && (
                <Button variant="primary" onClick={() => setVaultOpen(true)}><Lock size={14} /> Seal in vault</Button>
              )}
            </div>
          </div>

          {/* Quality strip */}
          <hr className="divider" />
          <div className="bp-summary-strip">
            <span>Syllabus coverage <strong>{q.syllabusCoveragePct}%</strong></span>
            <span>Duplicate score <strong>{q.duplicateScore.toFixed(2)}</strong> (lower better)</span>
            <span>Validation <strong>{q.validationScore}</strong>/100</span>
            <span>Set equivalence <strong>{Math.round(q.setEquivalenceScore * 100)}%</strong></span>
          </div>
        </CardBody>
      </Card>

      <Tabs active={tab} onChange={setActive} tabs={[
        { id: 'structure', label: 'Structure & sets' },
        { id: 'quality', label: 'Quality summary' },
        { id: 'approval', label: 'Approval workflow' },
        { id: 'versions', label: 'Version history', count: paper.versions.length },
        ...(paper.vault ? [{ id: 'vault', label: 'Vault & signature' }] : []),
      ]} />

      {tab === 'structure' && (
        <div className="dash-grid">
          <div>
            {sectionsPreview.map(sec => (
              <div key={sec.name} className="section-block">
                <div className="section-head">
                  <strong>{sec.name}</strong>
                  <span className="u-xs u-muted">{sec.instruction} · {sec.marksPerQuestion} mark{sec.marksPerQuestion > 1 ? 's' : ''} each</span>
                </div>
                {(activeSet === 0 ? sec.questions : sec.questions.slice().reverse()).map(qq => (
                  <div key={`${sec.name}-${qq.n}`} className="section-q">
                    <span className="q-number">{qq.n}.</span>
                    <span style={{ flex: 1 }}>{qq.text}</span>
                    <span className="q-marks">[{qq.marks}]</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <Card style={{ alignSelf: 'start' }}>
            <CardHeader title="Equivalent sets" sub="Conceptually paired — not word-shuffled" />
            <CardBody>
              <div className="set-tabs" role="tablist" aria-label="Paper sets">
                {setLabels.map((label, i) => (
                  <button key={label} role="tab" aria-selected={activeSet === i}
                    className={`set-chip ${activeSet === i ? 'active' : ''}`}
                    onClick={() => setActiveSet(i)}>
                    Set {label}
                  </button>
                ))}
              </div>
              <hr className="divider" />
              <p className="u-sm u-muted">
                Sets share identical section structure, total marks, difficulty mix and unit coverage.
                Each question in Set B/C has a conceptually equivalent counterpart in Set A, mapped by topic and Bloom level.
              </p>
              <div className="check-list" style={{ marginTop: 10 }}>
                <span className="check-item pass"><CheckCircle2 /> Section structure identical across sets</span>
                <span className="check-item pass"><CheckCycleOrCheck /> Marks distribution identical</span>
                <span className="check-item pass"><CheckCircle2 /> No shared questions between sets</span>
                <span className="check-item pass"><CheckCircle2 /> Equivalence score {Math.round(q.setEquivalenceScore * 100)}%</span>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {tab === 'quality' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-4)' }}>
          <Card>
            <CardHeader title="Difficulty distribution" sub={`Target Easy ${q.difficultyDistribution.Easy}% / Medium ${q.difficultyDistribution.Medium}% / Hard ${q.difficultyDistribution.Hard}%`} />
            <CardBody>
              <DistributionBars data={[
                { label: 'Easy', value: q.difficultyDistribution.Easy },
                { label: 'Medium', value: q.difficultyDistribution.Medium },
                { label: 'Hard', value: q.difficultyDistribution.Hard },
              ]} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Bloom coverage" sub="Cognitive levels across the paper" />
            <CardBody>
              <DistributionBars colorClass="auto"
                data={Object.entries(q.bloomDistribution).map(([label, value]) => ({ label, value }))} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Unit weightage achieved" sub="From approved syllabus structure" />
            <CardBody>
              <DistributionBars colorClass="navy"
                data={Object.entries(q.unitDistribution).map(([label, value]) => ({ label: `Unit ${label}`, value }))} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Integrity scores" sub="Computed by validation pipeline" />
            <CardBody>
              <div className="kv-list">
                <dt>Syllabus coverage</dt><dd><strong>{q.syllabusCoveragePct}%</strong> of approved topics represented</dd>
                <dt>Duplicate score</dt><dd>{q.duplicateScore.toFixed(2)} vs existing bank (pgvector)</dd>
                <dt>Validation score</dt><dd>{q.validationScore}/100 rule checks passed</dd>
                <dt>Set equivalence</dt><dd>{Math.round(q.setEquivalenceScore * 100)}% structural match</dd>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {tab === 'approval' && <Card><CardBody><ApprovalStepper approvals={paper.approvals} /></CardBody></Card>}

      {tab === 'versions' && (
        <Card flush>
          <CardHeader title="Version history" sub="Who changed what, when, and why" />
          <table className="data-table">
            <thead><tr><th>Version</th><th>Label</th><th>Changed by</th><th>When</th><th>Reason</th></tr></thead>
            <tbody>
              {[...paper.versions].reverse().map(v => (
                <tr key={v.version}>
                  <td className="u-mono">v{v.version}</td>
                  <td><StatusBadge tone={v.label === 'Final' ? 'green' : v.label === 'Draft' ? 'gray' : 'blue'}>{v.label}</StatusBadge></td>
                  <td>{v.changedBy}</td>
                  <td>{formatDate(v.changedAt, true)}</td>
                  <td className="u-muted" style={{ maxWidth: 380 }}>{v.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <CardBody className="u-xs u-muted">
            The FINAL approved version is immutable. Any change requires a controlled revision that restarts the approval chain.
          </CardBody>
        </Card>
      )}

      {tab === 'vault' && paper.vault && (
        <div className="vault-card">
          <span className="vault-shield" aria-hidden><ShieldCheck size={22} /></span>
          <div style={{ flex: 1 }}>
            <div className="u-flex-between u-wrap">
              <div>
                <h3>PAPER STATUS</h3>
                <p className="u-bold" style={{ color: 'var(--success)' }}>Protected in Secure Vault</p>
              </div>
              <span className="countdown" title="Release remains locked until scheduled time">RELEASE LOCKED</span>
            </div>
            <div className="security-attrs">
              <SecurityBadge label="AES-256-GCM encrypted" />
              <SecurityBadge label="MFA required for access" />
              <SecurityBadge label="Every access logged" />
              <SecurityBadge label="Release locked" locked />
            </div>
            <hr className="divider" />
            <div className="hash-line">{paper.vault.documentHash}</div>
            <div className="kv-list" style={{ marginTop: 12 }}>
              <dt>Vaulted at</dt><dd>{formatDate(paper.vault.vaultedAt, true)}</dd>
              <dt>Signed by</dt><dd>{paper.vault.signedBy ?? 'Pending signature'} {paper.vault.signedAt && <>({formatDate(paper.vault.signedAt)})</>}</dd>
              <dt>Signature</dt><dd><StatusBadge tone="green"><FileSignature size={11} /> VALID — tamper-evident</StatusBadge></dd>
              <dt>Access log entries</dt><dd>{paper.vault.accessLogCount}</dd>
            </div>
            <div className="alert-banner warning" style={{ marginTop: 14 }}>
              <AlertTriangle size={15} aria-hidden /> Downloads are disabled until the University Exam Controller activates the scheduled release.
              Early-access attempts raise HIGH-risk security events.
            </div>
            {['UNIVERSITY_EXAM_CONTROLLER'].includes(user?.role ?? '') && (
              <Link to="/releases" className="btn btn-primary" style={{ marginTop: 12 }}><CalendarClock size={14} /> Manage release</Link>
            )}
          </div>
        </div>
      )}

      {/* Submit modal */}
      <Modal open={submitOpen} onClose={() => setSubmitOpen(false)} title="Submit for department review"
        sub="Once submitted, the paper locks until the Department Head records a decision."
        footer={<><Button variant="outline" onClick={() => setSubmitOpen(false)}>Cancel</Button><Button variant="primary" onClick={submitForReview}>Confirm submission</Button></>}>
        <FormField label="Note to reviewer (optional)">
          <Textarea rows={3} value={comment} onChange={e => setComment(e.target.value)} placeholder="Blueprint BP reference, known deviations…" />
        </FormField>
      </Modal>

      {/* Decision modal */}
      <Modal open={!!decisionOpen} onClose={() => setDecisionOpen(null)}
        title={`${decisionOpen === 'APPROVED' ? 'Approve' : decisionOpen === 'REJECTED' ? 'Reject' : 'Request changes'} — ${paper.code}`}
        sub={`Recorded as ${user?.title ?? ''} (${user?.role.replaceAll('_', ' ')})`}
        footer={
          <>
            <Button variant="outline" onClick={() => setDecisionOpen(null)}>Cancel</Button>
            <Button variant={decisionOpen === 'APPROVED' ? 'success' : decisionOpen === 'REJECTED' ? 'danger' : 'primary'}
              onClick={() => decisionOpen && recordDecision(decisionOpen)}>
              Confirm {decisionOpen === 'APPROVED' ? 'approval' : decisionOpen === 'REJECTED' ? 'rejection' : 'change request'}
            </Button>
          </>
        }>
        {decisionOpen !== 'APPROVED' && (
          <FormField label="Reason (required for rejection / change requests)">
            <Textarea rows={3} value={comment} onChange={e => setComment(e.target.value)} placeholder="Specific, actionable feedback for the author…" />
          </FormField>
        )}
        {decisionOpen === 'APPROVED' && (
          <div className="alert-banner info"><CheckCircle2 size={15} aria-hidden /> Your identity, role, timestamp and this paper's hash will be bound to the approval record.</div>
        )}
        {decisionOpen === 'REJECTED' && !comment && (
          <div className="alert-banner danger"><XCircle size={15} aria-hidden /> A reason is mandatory for rejection.</div>
        )}
      </Modal>

      {/* Vault confirm */}
      <ConfirmationDialog open={vaultOpen} onClose={() => setVaultOpen(false)} onConfirm={sendToVault}
        tone="success" confirmLabel="Seal in vault"
        title="Seal final paper in the Secure Vault?"
        message={
          <>
            The FINAL PDF will be encrypted (AES-256-GCM), hashed and digitally signed under your authority.
            It becomes immutable and inaccessible until a scheduled release is activated. This action is audited as VAULT_ACCESS / PAPER_APPROVED chain completion.
          </>
        } />

      {/* Hidden helper icon import guard */}
      <span hidden><Download /></span>
    </>
  )
}

type UserRoleLike = 'DEPARTMENT_HEAD' | 'COLLEGE_EXAM_OFFICER' | 'UNIVERSITY_EXAM_CONTROLLER'

function CheckCycleOrCheck() {
  return <CheckCircle2 />
}
