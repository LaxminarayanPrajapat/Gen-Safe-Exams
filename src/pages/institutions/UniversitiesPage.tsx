import { useState } from 'react'
import { Landmark, Plus, Eye, PauseCircle, CheckCircle2, History } from 'lucide-react'
import { Card, CardHeader, CardBody, StatusBadge, statusTone, DataTable } from '@/components/ui'
import type { Column } from '@/components/ui/DataTable'
import { Modal, ConfirmationDialog } from '@/components/ui/Modal'
import { FormField, Input } from '@/components/ui/FormControls'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/context/ToastContext'
import { universities as seed, colleges } from '@/data/demo'
import type { University } from '@/types'
import { formatDate } from '@/utils'

export default function UniversitiesPage() {
  const toast = useToast()
  const [rows, setRows] = useState<University[]>(seed)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [detail, setDetail] = useState<University | null>(null)
  const [suspendTarget, setSuspendTarget] = useState<University | null>(null)
  const [form, setForm] = useState({ name: '', code: '', location: '', adminEmail: '' })

  const columns: Column<University>[] = [
    {
      key: 'name', header: 'University',
      render: u => (
        <span className="cell-main">{u.name}<div className="cell-sub">{u.location} · est. {u.establishedYear}</div></span>
      ),
    },
    { key: 'code', header: 'Code', render: u => <span className="u-mono">{u.code}</span> },
    { key: 'colleges', header: 'Colleges', render: u => String(colleges.filter(c => c.universityId === u.id).length) },
    { key: 'admin', header: 'Responsible admin', render: u => <>{u.adminName}<div className="cell-sub">{u.adminEmail}</div></> },
    { key: 'status', header: 'Status', render: u => <StatusBadge tone={statusTone(u.status)}>{u.status.replaceAll('_', ' ')}</StatusBadge> },
    { key: 'created', header: 'Registered', render: u => formatDate(u.createdAt) },
    {
      key: 'actions', header: '', align: 'right',
      render: u => (
        <div className="row-actions">
          <button className="icon-btn" title="View details & audit history" onClick={() => setDetail(u)}><Eye size={15} /></button>
          {u.status === 'PENDING_APPROVAL' && (
            <button className="icon-btn" title="Approve university" onClick={() => approve(u)}><CheckCircle2 size={15} color="var(--success)" /></button>
          )}
          {u.status === 'ACTIVE' && (
            <button className="icon-btn" title="Suspend university" onClick={() => setSuspendTarget(u)}><PauseCircle size={15} color="var(--danger)" /></button>
          )}
        </div>
      ),
    },
  ]

  const register = (e: React.FormEvent) => {
    e.preventDefault()
    const nu: University = {
      id: `univ-${Date.now()}`, name: form.name, code: form.code.toUpperCase(),
      location: form.location, adminName: '—', adminEmail: form.adminEmail,
      status: 'PENDING_APPROVAL', establishedYear: new Date().getFullYear(),
      createdAt: new Date().toISOString(),
    }
    setRows([nu, ...rows])
    setRegisterOpen(false)
    setForm({ name: '', code: '', location: '', adminEmail: '' })
    toast.push('success', 'University registered', `${nu.name} created with PENDING_APPROVAL status. Audit event UNIVERSITY_REGISTERED recorded.`)
  }

  const approve = (u: University) => {
    setRows(rows.map(r => r.id === u.id ? { ...r, status: 'ACTIVE' } : r))
    toast.push('success', 'University approved', `${u.name} is now ACTIVE. Immutable audit event recorded.`)
  }

  const suspend = () => {
    if (!suspendTarget) return
    setRows(rows.map(r => r.id === suspendTarget.id ? { ...r, status: 'SUSPENDED' } : r))
    toast.push('warning', 'University suspended', `${suspendTarget.name} suspended. All member accounts lose write access; papers remain sealed in the vault.`)
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Universities</h1>
          <p className="page-desc">Only the platform Super Admin registers universities. New institutions start in PENDING_APPROVAL.</p>
        </div>
        <Button onClick={() => setRegisterOpen(true)}><Plus size={14} /> Register university</Button>
      </div>

      <DataTable columns={columns} rows={rows} rowKey={u => u.id}
        emptyState={<p style={{ padding: 32 }} className="u-center u-muted">No universities registered yet.</p>} />

      <Modal open={registerOpen} onClose={() => setRegisterOpen(false)}
        title="Register university" sub="Creates the tenant root. A responsible administrator must be assigned before approval."
        footer={
          <>
            <Button variant="outline" onClick={() => setRegisterOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" form="reg-univ">Create university</Button>
          </>
        }>
        <form id="reg-univ" onSubmit={register}>
          <FormField label="University name" required htmlFor="un-name">
            <Input id="un-name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Shivaji University" />
          </FormField>
          <div className="form-row">
            <FormField label="Institution code" required hint="Short unique code used on papers">
              <Input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="SUK" maxLength={12} />
            </FormField>
            <FormField label="Location" required>
              <Input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="City, State" />
            </FormField>
          </div>
          <FormField label="Responsible administrator email" required hint="Must be an official institutional address — verification is sent here.">
            <Input type="email" required value={form.adminEmail} onChange={e => setForm({ ...form, adminEmail: e.target.value })} placeholder="registrar@university.edu.in" />
          </FormField>
          <div className="alert-banner info"><Landmark size={15} aria-hidden /> This action is recorded as an immutable audit event (UNIVERSITY_REGISTERED).</div>
        </form>
      </Modal>

      {/* Detail drawer-style modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} wide
        title={detail?.name ?? ''} sub={`${detail?.location ?? ''} · ${detail?.status.replaceAll('_', '')}`}>
        {detail && (
          <>
            <div className="kv-list" style={{ marginBottom: 16 }}>
              <dt>Institution code</dt><dd className="u-mono">{detail.code}</dd>
              <dt>Status</dt><dd><StatusBadge tone={statusTone(detail.status)}>{detail.status.replaceAll('_', ' ')}</StatusBadge></dd>
              <dt>Administrator</dt><dd>{detail.adminName} ({detail.adminEmail})</dd>
              <dt>Registered</dt><dd>{formatDate(detail.createdAt)}</dd>
              <dt>Colleges</dt><dd>{colleges.filter(c => c.universityId === detail.id).length} registered</dd>
            </div>
            <h4 style={{ marginBottom: 8 }}>Audit history</h4>
            <div className="timeline">
              <div className="timeline-item">
                <span className="timeline-dot done" /><div className="timeline-title">UNIVERSITY_REGISTERED</div>
                <div className="timeline-meta">Arjun Mehta · SUPER_ADMIN · {formatDate(detail.createdAt, true)}</div>
              </div>
              <div className="timeline-item">
                <span className={`timeline-dot ${detail.status !== 'PENDING_APPROVAL' ? 'done' : 'current'}`} />
                <div className="timeline-title">UNIVERSITY_APPROVED</div>
                <div className="timeline-meta">{detail.status === 'ACTIVE' ? 'Completed · audit event stored' : 'Pending Super Admin decision'}</div>
              </div>
            </div>
          </>
        )}
      </Modal>

      <ConfirmationDialog
        open={!!suspendTarget}
        onClose={() => setSuspendTarget(null)}
        onConfirm={suspend}
        tone="danger"
        confirmLabel="Suspend university"
        title="Suspend this university?"
        message={
          <>
            Suspending <strong>{suspendTarget?.name}</strong> will immediately block all member sign-ins and freeze paper workflows.
            Vaulted examination papers remain encrypted and protected. Every affected session is terminated and logged.
          </>
        }
      />

      <Card style={{ marginTop: 'var(--sp-4)' }}>
        <CardBody className="u-xs u-muted">
          <History size={12} aria-hidden /> Tenant note: each university is a hard data boundary. Queries are always scoped by organization_id;
          cross-university reads require an explicit SUPER_ADMIN context and are themselves audited.
        </CardBody>
      </Card>
    </>
  )
}
