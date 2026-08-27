import { useState } from 'react'
import { Plus, Eye, CheckCircle2, PauseCircle } from 'lucide-react'
import { StatusBadge, statusTone, DataTable } from '@/components/ui'
import type { Column } from '@/components/ui/DataTable'
import { Modal, ConfirmationDialog } from '@/components/ui/Modal'
import { FormField, Input, Select } from '@/components/ui/FormControls'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/context/ToastContext'
import { colleges as seed, universities, departments } from '@/data/demo'
import { useAuth } from '@/context/AuthContext'
import type { College } from '@/types'
import { formatDate } from '@/utils'

export default function CollegesPage() {
  const toast = useToast()
  const { user } = useAuth()
  // Tenant scoping: UNIVERSITY_ADMIN sees own university's colleges only.
  const visible = user?.role === 'UNIVERSITY_ADMIN' ? seed.filter(c => c.universityId === user.organizationId) : seed

  const [rows, setRows] = useState<College[]>(visible)
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<College | null>(null)
  const [suspendTarget, setSuspendTarget] = useState<College | null>(null)
  const [form, setForm] = useState({ name: '', code: '', location: '', adminEmail: '' })

  const canRegister = user?.role === 'UNIVERSITY_ADMIN'

  const columns: Column<College>[] = [
    {
      key: 'name', header: 'College',
      render: c => <span className="cell-main">{c.name}<div className="cell-sub">{c.universityName}</div></span>,
    },
    { key: 'code', header: 'Code', render: c => <span className="u-mono">{c.code}</span> },
    { key: 'location', header: 'Location', render: c => c.location },
    {
      key: 'depts', header: 'Departments',
      render: c => String(departments.filter(d => d.collegeId === c.id).length),
    },
    { key: 'admin', header: 'Principal / Admin', render: c => <>{c.adminName}<div className="cell-sub">{c.adminEmail}</div></> },
    { key: 'status', header: 'Status', render: c => <StatusBadge tone={statusTone(c.status)}>{c.status.replaceAll('_', ' ')}</StatusBadge> },
    { key: 'created', header: 'Registered', render: c => formatDate(c.createdAt) },
    {
      key: 'actions', header: '', align: 'right',
      render: c => (
        <div className="row-actions">
          <button className="icon-btn" title="View college" onClick={() => setDetail(c)}><Eye size={15} /></button>
          {c.status === 'PENDING_APPROVAL' && (
            <button className="icon-btn" title="Approve college" onClick={() => approve(c)}><CheckCircle2 size={15} color="var(--success)" /></button>
          )}
          {c.status === 'ACTIVE' && (
            <button className="icon-btn" title="Suspend college" onClick={() => setSuspendTarget(c)}><PauseCircle size={15} color="var(--danger)" /></button>
          )}
        </div>
      ),
    },
  ]

  const register = (e: React.FormEvent) => {
    e.preventDefault()
    const uni = universities.find(u => u.id === (user?.role === 'UNIVERSITY_ADMIN' ? user.organizationId : 'univ-shivaji'))!
    const nc: College = {
      id: `col-${Date.now()}`, universityId: uni.id, universityName: uni.name,
      name: form.name, code: form.code.toUpperCase(), location: form.location,
      adminName: '—', adminEmail: form.adminEmail, status: 'PENDING_APPROVAL',
      createdAt: new Date().toISOString(),
    }
    setRows([nc, ...rows])
    setOpen(false)
    setForm({ name: '', code: '', location: '', adminEmail: '' })
    toast.push('success', 'College registered', `${nc.name} created under ${uni.name}. COLLEGE_REGISTERED audit event recorded.`)
  }

  const approve = (c: College) => {
    setRows(rows.map(r => r.id === c.id ? { ...r, status: 'ACTIVE' } : r))
    toast.push('success', 'College approved', `${c.name} is now ACTIVE.`)
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Colleges</h1>
          <p className="page-desc">Colleges are registered and approved by the University Admin within your tenant boundary.</p>
        </div>
        {canRegister && <Button onClick={() => setOpen(true)}><Plus size={14} /> Register college</Button>}
      </div>

      <DataTable columns={columns} rows={rows} rowKey={c => c.id} />

      <Modal open={open} onClose={() => setOpen(false)} title="Register college"
        sub="The college inherits your university tenant. Approval is required before departments can be created."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" form="reg-col">Create college</Button>
          </>
        }>
        <form id="reg-col" onSubmit={register}>
          <FormField label="College name" required htmlFor="col-name">
            <Input id="col-name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., D.K.T.E. Society's Textile & Engineering Institute" />
          </FormField>
          <div className="form-row">
            <FormField label="College code" required>
              <Input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="DKTE-TEI" maxLength={16} />
            </FormField>
            <FormField label="Location" required>
              <Input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="City, State" />
            </FormField>
          </div>
          <FormField label="Principal / responsible admin email" required>
            <Input type="email" required value={form.adminEmail} onChange={e => setForm({ ...form, adminEmail: e.target.value })} placeholder="principal@college.edu.in" />
          </FormField>
        </form>
      </Modal>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.name ?? ''}
        sub={`${detail?.universityName ?? ''} · ${detail?.status.replaceAll('_', '') ?? ''}`}>
        {detail && (
          <div className="kv-list">
            <dt>Code</dt><dd className="u-mono">{detail.code}</dd>
            <dt>Location</dt><dd>{detail.location}</dd>
            <dt>Administrator</dt><dd>{detail.adminName}</dd>
            <dt>Departments</dt><dd>{departments.filter(d => d.collegeId === detail.id).map(d => d.name).join(', ') || 'None yet'}</dd>
            <dt>Registered</dt><dd>{formatDate(detail.createdAt)}</dd>
            <dt>Tenant ID</dt><dd className="u-mono u-xs">{detail.id}</dd>
          </div>
        )}
      </Modal>

      <ConfirmationDialog open={!!suspendTarget} onClose={() => setSuspendTarget(null)}
        onConfirm={() => {
          if (!suspendTarget) return
          setRows(rows.map(r => r.id === suspendTarget.id ? { ...r, status: 'SUSPENDED' as const } : r))
          toast.push('warning', 'College suspended', `${suspendTarget.name} suspended — write access frozen across all departments.`)
        }}
        tone="danger" confirmLabel="Suspend college"
        title={`Suspend ${suspendTarget?.name ?? ''}?`}
        message="All department workflows pause immediately. Vaulted papers remain sealed. This action requires Super Admin review to reverse." />
    </>
  )
}
