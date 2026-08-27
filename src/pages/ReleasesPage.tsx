import { useEffect, useState } from 'react'
import { CalendarClock, Plus, TimerReset, Play, Archive } from 'lucide-react'
import {
  Card, CardHeader, CardBody, Button, StatusBadge, DataTable, Modal,
  FormField, Input, Select, ConfirmationDialog, EmptyState,
} from '@/components/ui'
import type { Column } from '@/components/ui/DataTable'
import { useToast } from '@/context/ToastContext'
import { releases as seedReleases, papers } from '@/data/demo'
import type { PaperRelease } from '@/types'
import { formatDate } from '@/utils'

export default function ReleasesPage() {
  const toast = useToast()
  const [rows, setRows] = useState<PaperRelease[]>(seedReleases)
  const [createOpen, setCreateOpen] = useState(false)
  const [activateTarget, setActivateTarget] = useState<PaperRelease | null>(null)
  const [form, setForm] = useState({ paperId: '', examDate: '2026-12-08', examTime: '10:00', releaseTime: '09:55' })
  const [, setTick] = useState(0)

  // Live countdown ticker
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const vaultedPapers = papers.filter(p => p.status === 'IN_VAULT' || p.status === 'APPROVED')

  const columns: Column<PaperRelease>[] = [
    { key: 'paper', header: 'Paper', render: r => <span className="cell-main">{r.paperCode}<div className="cell-sub">{r.setTitle}</div></span> },
    {
      key: 'exam', header: 'Examination',
      render: r => <>{formatDate(r.examDate)}<div className="cell-sub">{r.examTime}</div></>,
    },
    { key: 'release', header: 'Release at', render: r => formatDate(r.releaseAt, true) },
    {
      key: 'countdown', header: 'Status',
      render: r => (
        <span className="u-flex">
          <StatusBadge tone={statusToneSafe(r.status)}>{r.status}</StatusBadge>
          {r.status === 'SCHEDULED' && <Countdown to={r.releaseAt} />}
        </span>
      ),
    },
    { key: 'delivered', header: 'Delivery', render: r => <span className="u-xs u-muted" style={{ maxWidth: 220 }}>{r.deliveredTo}</span> },
    {
      key: 'actions', header: '', align: 'right',
      render: r => (
        <div className="row-actions">
          {r.status === 'SCHEDULED' && (
            <button className="icon-btn" title="Activate release now (authorized officers only)" onClick={() => setActivateTarget(r)}>
              <Play size={15} color="var(--success)" />
            </button>
          )}
          {(r.status === 'DELIVERED' || r.status === 'ACTIVE') && (
            <button className="icon-btn" title="Archive / revoke post-exam access per policy"
              onClick={() => { setRows(rows.map(x => x.id === r.id ? { ...x, status: 'REVOKED' } : x)); toast.push('info', 'Access revoked', `${r.paperCode} delivery channel closed. Post-exam policy applied and audited.`) }}>
              <Archive size={15} />
            </button>
          )}
        </div>
      ),
    },
  ]

  const createRelease = (e: React.FormEvent) => {
    e.preventDefault()
    const paper = papers.find(p => p.id === form.paperId)
    if (!paper) return
    const nr: PaperRelease = {
      id: `rel-${Date.now()}`, paperId: paper.id, paperCode: paper.code,
      setTitle: 'All Sets', examDate: form.examDate, examTime: form.examTime,
      releaseAt: `${form.examDate}T${form.releaseTime}:00`,
      status: 'SCHEDULED',
      deliveredTo: 'Chief Custodian — Exam Cell (offline delivery)',
    }
    setRows([nr, ...rows])
    setCreateOpen(false)
    toast.push('success', 'Release scheduled',
      `${paper.code} unlocks automatically at ${formatDate(nr.releaseAt, true)}. Until then the vault remains sealed; activation requires an authorized officer.`)
  }

  const activate = () => {
    if (!activateTarget) return
    setRows(rows.map(r => r.id === activateTarget.id ? { ...r, status: 'ACTIVE', activatedBy: 'You (Exam Controller)', activatedAt: new Date().toISOString() } : r))
    toast.push('success', 'Release activated', `${activateTarget.paperCode} delivery channel is now live. PAPER_RELEASED audit event recorded with your identity.`)
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Scheduled secure release</h1>
          <p className="page-desc">
            Papers unlock automatically at the scheduled time — typically 5 minutes before the exam. Early manual activation is possible only for University Exam Controllers and is fully audited.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} disabled={vaultedPapers.length === 0}>
          <Plus size={14} /> Schedule release
        </Button>
      </div>

      {rows.length === 0
        ? <Card><CardBody><EmptyState icon={CalendarClock} title="No releases scheduled" /></CardBody></Card>
        : <DataTable columns={columns} rows={rows} rowKey={r => r.id} />}

      <Card style={{ marginTop: 'var(--sp-4)' }}>
        <CardHeader title="Release policy" sub="Applied by the platform, not by individuals" />
        <CardBody className="u-sm u-stack-2">
          <div className="u-flex"><TimerReset size={14} aria-hidden /> Default release offset: 5 minutes before exam start.</div>
          <div className="u-flex"><Play size={14} aria-hidden /> Manual early activation requires MFA re-challenge + dual approval and is logged as a high-visibility event.</div>
          <div className="u-flex"><Archive size={14} aria-hidden /> After examination, access is revoked or archived according to institutional retention policy.</div>
        </CardBody>
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Schedule secure release"
        sub="The selected paper must be sealed in the vault."
        footer={<><Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button variant="primary" type="submit" form="rel-form">Schedule</Button></>}>
        <form id="rel-form" onSubmit={createRelease}>
          <FormField label="Vaulted paper" required>
            <Select required value={form.paperId} onChange={e => setForm({ ...form, paperId: e.target.value })} aria-label="Paper"
              options={[{ value: '', label: 'Select vaulted paper' }, ...vaultedPapers.map(p => ({ value: p.id, label: p.code }))]} />
          </FormField>
          <div className="form-row">
            <FormField label="Exam date" required>
              <Input type="date" required value={form.examDate} onChange={e => setForm({ ...form, examDate: e.target.value })} />
            </FormField>
            <FormField label="Exam start" required>
              <Input type="time" required value={form.examTime} onChange={e => setForm({ ...form, examTime: e.target.value })} />
            </FormField>
            <FormField label="Release at" required hint="Recommended: 09:55 for a 10:00 exam">
              <Input type="time" required value={form.releaseTime} onChange={e => setForm({ ...form, releaseTime: e.target.value })} />
            </FormField>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog open={!!activateTarget} onClose={() => setActivateTarget(null)}
        onConfirm={activate} tone="primary" confirmLabel="Activate now"
        title={`Activate ${activateTarget?.paperCode ?? ''} before schedule?`}
        message={
          <>
            The scheduled unlock time has not yet arrived. Manual activation will immediately open the delivery channel and is recorded as an
            <strong> out-of-band release event</strong> visible to auditors. Continue only if you hold dual authorization.
          </>
        } />
    </>
  )
}

function Countdown({ to }: { to: string }) {
  const diff = new Date(to).getTime() - Date.now()
  if (Number.isNaN(diff)) return null
  if (diff <= 0) return <span className="badge badge-green">due now</span>
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  return <span className="u-mono u-xs u-muted">T−{days}d {hours}h {mins}m</span>
}

function statusToneSafe(status: string): 'green' | 'amber' | 'blue' | 'gray' | 'red' {
  switch (status) {
    case 'ACTIVE': case 'DELIVERED': return 'green'
    case 'SCHEDULED': return 'amber'
    case 'EXPIRED': return 'gray'
    default: return 'red'
  }
}
