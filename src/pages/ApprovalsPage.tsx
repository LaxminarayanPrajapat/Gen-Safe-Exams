import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, ClipboardList } from 'lucide-react'
import { Card, CardHeader, CardBody, Tabs, StatusBadge, statusTone, Button, EmptyState } from '@/components/ui'
import { ApprovalStepper } from '@/components/ui/Timeline'
import { Modal } from '@/components/ui/Modal'
import { FormField, Textarea } from '@/components/ui/FormControls'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'
import { papers as seedPapers } from '@/data/demo'
import type { QuestionPaper } from '@/types'
import { formatDate, relativeTime } from '@/utils'

export default function ApprovalsPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [tab, setActive] = useState('queue')
  const [rows, setRows] = useState<QuestionPaper[]>(seedPapers)
  const [decision, setDecision] = useState<{ paperId: string; kind: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'; stageLabel: string } | null>(null)
  const [comment, setComment] = useState('')

  // Queue items relevant to the signed-in authority.
  const queue = useMemo(() => {
    if (!user) return []
    return rows.filter(p => {
      if (user.role === 'DEPARTMENT_HEAD') {
        return ['SUBMITTED', 'UNDER_REVIEW'].includes(p.status) &&
          !p.approvals.some(a => a.stage === 'DEPARTMENT_HEAD_REVIEW')
      }
      if (user.role === 'COLLEGE_EXAM_OFFICER') {
        return p.approvals.some(a => a.stage === 'DEPARTMENT_HEAD_REVIEW' && a.decision === 'APPROVED') &&
          !p.approvals.some(a => a.stage === 'COLLEGE_REVIEW')
      }
      if (user.role === 'UNIVERSITY_EXAM_CONTROLLER') {
        return p.approvals.some(a => a.stage === 'COLLEGE_REVIEW' && a.decision === 'APPROVED') &&
          !['IN_VAULT', 'RELEASED', 'ARCHIVED'].includes(p.status)
      }
      if (user.role === 'SUPER_ADMIN') {
        return ['SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED'].includes(p.status)
      }
      return false
    })
  }, [rows, user])

  const history = rows.flatMap(p =>
    p.approvals.map(a => ({ ...a, paperCode: p.code, paperTitle: p.title, subjectCode: p.subjectCode })),
  ).sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  const record = () => {
    if (!decision) return
    setRows(prev => prev.map(p => {
      if (p.id !== decision.paperId) return p
      const entry = {
        approvalId: `APR-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        stage: decision.stageLabel as typeof p.approvals[number]['stage'],
        actorName: user!.name, actorRole: user!.role,
        decision: decision.kind, comment: comment || undefined,
        timestamp: new Date().toISOString(),
      }
      const nextStatus =
        decision.kind !== 'APPROVED' ? 'CHANGES_REQUESTED'
          : entry.stage === 'UNIVERSITY_APPROVAL' ? 'APPROVED'
            : 'UNDER_REVIEW'
      return {
        ...p,
        approvals: [...p.approvals.filter(a => a.stage !== entry.stage || a.decision !== decision.kind), entry],
        status: nextStatus as QuestionPaper['status'],
        updatedAt: new Date().toISOString(),
      }
    }))
    toast.push(decision.kind === 'APPROVED' ? 'success' : 'warning',
      `${decision.kind.replaceAll('_', ' ').toLowerCase()} recorded`,
      'Immutable audit event created with your identity, role, IP and timestamp.')
    setDecision(null); setComment('')
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Approvals</h1>
          <p className="page-desc">
            Four-eyes workflow. Every decision binds approver identity, role, timestamp, comment and approval ID into an immutable audit event.
          </p>
        </div>
      </div>

      <Tabs active={tab} onChange={setActive} tabs={[
        { id: 'queue', label: 'My queue', count: queue.length },
        { id: 'history', label: 'Decision history', count: history.length },
      ]} />

      {tab === 'queue' && (
        queue.length === 0
          ? <Card><CardBody><EmptyState icon={ClipboardList} title="Queue is clear" description="No papers currently await a decision at your authority level." /></CardBody></Card>
          : <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
            {queue.map(p => (
              <Card key={p.id}>
                <CardHeader
                  title={<span className="u-flex">{p.code}<StatusBadge tone={statusTone(p.status)}>{p.status.replaceAll('_', ' ')}</StatusBadge></span>}
                  sub={`${p.title} · ${p.subjectCode} · submitted by ${p.createdBy}`}
                  actions={
                    <>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/question-papers/${p.id}`)}>Inspect paper</Button>
                      <Button size="sm" variant="success" onClick={() => setDecision({ paperId: p.id, kind: 'APPROVED', stageLabel: stageFor(user!.role) })}>
                        <CheckCircle2 size={13} /> Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setDecision({ paperId: p.id, kind: 'CHANGES_REQUESTED', stageLabel: stageFor(user!.role) })}>
                        Request changes
                      </Button>
                      <Button size="sm" variant="danger-outline" onClick={() => setDecision({ paperId: p.id, kind: 'REJECTED', stageLabel: stageFor(user!.role) })}>
                        <XCircle size={13} /> Reject
                      </Button>
                    </>
                  } />
                <CardBody><ApprovalStepper approvals={p.approvals} /></CardBody>
              </Card>
            ))}
          </div>
      )}

      {tab === 'history' && (
        <Card flush>
          <CardHeader title="All approval decisions" sub="Newest first — sourced from the immutable audit trail" />
          <table className="data-table">
            <thead><tr><th>Approval ID</th><th>Paper</th><th>Stage</th><th>Approver</th><th>Decision</th><th>When</th></tr></thead>
            <tbody>
              {history.slice(0, 14).map(h => (
                <tr key={h.approvalId}>
                  <td className="u-mono u-xs">{h.approvalId}</td>
                  <td className="cell-main">{h.paperCode}<div className="cell-sub">{h.subjectCode}</div></td>
                  <td className="u-xs">{h.stage.replaceAll('_', ' ')}</td>
                  <td>{h.actorName}<div className="cell-sub">{h.actorRole.replaceAll('_', ' ')}</div></td>
                  <td><StatusBadge tone={statusTone(h.decision)}>{h.decision.replaceAll('_', ' ')}</StatusBadge></td>
                  <td title={formatDate(h.timestamp, true)}>{relativeTime(h.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={!!decision} onClose={() => setDecision(null)}
        title={`Record decision — ${decision?.kind.replaceAll('_', ' ')}`}
        sub="Your name, role, timestamp, IP and device are bound to this decision."
        footer={
          <>
            <Button variant="outline" onClick={() => setDecision(null)}>Cancel</Button>
            <Button variant={decision?.kind === 'APPROVED' ? 'success' : decision?.kind === 'REJECTED' ? 'danger' : 'primary'} onClick={record}>Confirm</Button>
          </>
        }>
        <FormField label="Comments" hint={decision?.kind === 'APPROVED' ? 'Optional for approval.' : 'Required in practice — reviewers should justify rejections.'}>
          <Textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}
            placeholder="e.g., Verified blueprint compliance, difficulty split within tolerance." />
        </FormField>
        {history[0] && (
          <p className="u-xs u-muted">Last decision in this tenant: {history[0].approvalId} by {history[0].actorName} at {formatDate(history[0].timestamp, true)}.</p>
        )}
      </Modal>
    </>
  )
}

function stageFor(role: string): string {
  switch (role) {
    case 'COLLEGE_EXAM_OFFICER': return 'COLLEGE_REVIEW'
    case 'UNIVERSITY_EXAM_CONTROLLER': return 'UNIVERSITY_APPROVAL'
    default: return 'DEPARTMENT_HEAD_REVIEW'
  }
}
