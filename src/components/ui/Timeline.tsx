import { CheckCircle2, XCircle } from 'lucide-react'
import type { ApprovalEntry } from '@/types'
import { formatDate } from '@/utils'

/* ---------- Timeline (audit / history / activity) ---------- */
export interface TimelineEntry {
  id: string
  title: string
  meta?: string
  body?: string
  state: 'done' | 'current' | 'pending' | 'rejected'
}

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <div className="timeline">
      {entries.map(e => (
        <div key={e.id} className="timeline-item">
          <span className={`timeline-dot ${e.state}`} aria-hidden />
          <div className="timeline-title">{e.title}</div>
          {e.meta && <div className="timeline-meta">{e.meta}</div>}
          {e.body && <div className="timeline-body">{e.body}</div>}
        </div>
      ))}
    </div>
  )
}

/* ---------- Approval stepper + approval history ---------- */
const STAGES: { id: ApprovalEntry['stage']; label: string; sub: string }[] = [
  { id: 'STAFF_SUBMISSION', label: 'Staff', sub: 'Submission' },
  { id: 'DEPARTMENT_HEAD_REVIEW', label: 'Department Head', sub: 'Review' },
  { id: 'COLLEGE_REVIEW', label: 'College Authority', sub: 'Review' },
  { id: 'UNIVERSITY_APPROVAL', label: 'University', sub: 'Final Approval' },
]

export function ApprovalStepper({ approvals }: { approvals: ApprovalEntry[] }) {
  // Determine the furthest completed stage and any rejection.
  let rejectedAt: number | null = null
  let lastDone = -1
  approvals.forEach(a => {
    const idx = STAGES.findIndex(s => s.id === a.stage)
    if (a.decision === 'APPROVED') lastDone = Math.max(lastDone, idx)
    if (a.decision === 'REJECTED' || a.decision === 'CHANGES_REQUESTED') rejectedAt = idx
  })

  return (
    <div>
      <div className="approval-stepper" aria-label="Approval workflow status">
        {STAGES.map((s, i) => {
          const state =
            rejectedAt !== null && i >= rejectedAt ? 'rejected'
              : i <= lastDone ? 'done'
                : i === lastDone + 1 ? 'current' : ''
          return (
            <div key={s.id} className={`stepper-step ${state}`}>
              <span className="stepper-node">
                {state === 'rejected' ? <XCircle size={13} aria-hidden />
                  : state === 'done' ? <CheckCircle2 size={13} aria-hidden /> : i + 1}
              </span>
              <div className="stepper-label">{s.label}</div>
              <div className="stepper-sub">{s.sub}</div>
            </div>
          )
        })}
        {/* Vault + release are terminal stages */}
        <div className={`stepper-step ${lastDone >= STAGES.length - 1 && rejectedAt === null ? 'current' : ''}`}>
          <span className="stepper-node"><CheckCircle2 size={13} aria-hidden /></span>
          <div className="stepper-label">Secure Vault</div>
          <div className="stepper-sub">Release locked</div>
        </div>
      </div>

      <div style={{ marginTop: 'var(--sp-4)' }}>
        {[...approvals].reverse().map(a => (
          <Timeline
            key={a.approvalId}
            entries={[{
              id: a.approvalId,
              title: `${stageLabel(a.stage)} — ${a.decision.replaceAll('_', ' ')}`,
              meta: `${a.actorName} · ${formatDate(a.timestamp, true)} · ID ${a.approvalId}`,
              body: a.comment,
              state: a.decision === 'APPROVED' ? 'done' : (a.decision === 'REJECTED' || a.decision === 'CHANGES_REQUESTED') ? 'rejected' : 'current',
            }]}
          />
        ))}
      </div>
    </div>
  )
}

function stageLabel(stage: ApprovalEntry['stage']): string {
  return STAGES.find(s => s.id === stage)?.label ?? stage.replaceAll('_', ' ')
}
