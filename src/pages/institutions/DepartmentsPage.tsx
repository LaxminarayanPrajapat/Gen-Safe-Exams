import { useState } from 'react'
import { Plus, Eye, UserPlus } from 'lucide-react'
import { StatusBadge, statusTone, DataTable } from '@/components/ui'
import type { Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { FormField, Input, Select } from '@/components/ui/FormControls'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/context/ToastContext'
import { departments as seed, colleges, staffMembers } from '@/data/demo'
import { useAuth } from '@/context/AuthContext'
import type { Department } from '@/types'
import { formatDate } from '@/utils'

export default function DepartmentsPage() {
  const toast = useToast()
  const { user } = useAuth()
  // Tenant scope
  const visible = user?.role === 'COLLEGE_ADMIN' ? seed.filter(d => d.collegeId === user.organizationId) : seed

  const [rows] = useState<Department[]>(visible)
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<Department | null>(null)
  const [form, setForm] = useState({ name: '', code: '', hodEmail: '' })

  const canCreate = user?.role === 'COLLEGE_ADMIN' || user?.role === 'UNIVERSITY_ADMIN'

  const columns: Column<Department>[] = [
    {
      key: 'name', header: 'Department',
      render: d => <span className="cell-main">{d.name}<div className="cell-sub">{d.collegeName.length > 34 ? d.code : d.collegeName}</div></span>,
    },
    { key: 'code', header: 'Code', render: d => <span className="u-mono">{d.code}</span> },
    { key: 'hod', header: 'Head of Department', render: d => <>{d.hodName ?? <span className="u-muted">Not assigned</span>}<div className="cell-sub">{d.hodEmail ?? ''}</div></> },
    { key: 'staff', header: 'Staff', render: d => String(staffMembers.filter(s => s.departmentId === d.id).length) },
    { key: 'verif', header: 'Verification', render: d => <StatusBadge tone={statusTone(d.verificationStatus)}>{d.verificationStatus.replaceAll('_', ' ')}</StatusBadge> },
    { key: 'created', header: 'Created', render: d => formatDate(d.createdAt) },
    {
      key: 'actions', header: '', align: 'right',
      render: d => (
        <div className="row-actions">
          <button className="icon-btn" title="View department" onClick={() => setDetail(d)}><Eye size={15} /></button>
          {(user?.role === 'COLLEGE_ADMIN') && (
            <button className="icon-btn" title="Assign HOD (invite staff)" onClick={() => setDetail(d)}><UserPlus size={15} /></button>
          )}
        </div>
      ),
    },
  ]

  const create = (e: React.FormEvent) => {
    e.preventDefault()
    setOpen(false)
    toast.push('success', 'Department created', `${form.name} registered. DEPARTMENT_CREATED audit event recorded; assign a Head to enable staff verification.`)
    setForm({ name: '', code: '', hodEmail: '' })
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Departments</h1>
          <p className="page-desc">Departments host subjects, staff and examination workflows inside their college tenant.</p>
        </div>
        {canCreate && <Button onClick={() => setOpen(true)}><Plus size={14} /> Create department</Button>}
      </div>

      <DataTable columns={columns} rows={rows} rowKey={d => d.id} />

      <Modal open={open} onClose={() => setOpen(false)} title="Create department"
        sub="A department head must be assigned and verified before staff can be onboarded."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" form="reg-dept">Create department</Button>
          </>
        }>
        <form id="reg-dept" onSubmit={create}>
          <FormField label="Department name" required htmlFor="dept-name">
            <Input id="dept-name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Computer Science & Engineering" />
          </FormField>
          <div className="form-row">
            <FormField label="Code" required>
              <Input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="CSE" maxLength={8} />
            </FormField>
            <FormField label="Proposed HOD email" hint="An official invitation will be sent for verification.">
              <Input type="email" value={form.hodEmail} onChange={e => setForm({ ...form, hodEmail: e.target.value })} placeholder="hod@college.edu.in" />
            </FormField>
          </div>
          <FormField label="College">
            <Select options={colleges.map(c => ({ value: c.id, label: c.name }))} defaultValue={user?.role === 'COLLEGE_ADMIN' ? user.organizationId : undefined} disabled={user?.role === 'COLLEGE_ADMIN'} aria-label="College" />
          </FormField>
        </form>
      </Modal>

      <Modal open={!!detail} onClose={() => setDetail(null)} wide title={detail?.name ?? ''}
        sub={`${detail?.collegeName ?? ''} · verification ${detail?.verificationStatus.replaceAll('_', '').toLowerCase()}`}>
        {detail && (
          <>
            <div className="kv-list">
              <dt>Code</dt><dd className="u-mono">{detail.code}</dd>
              <dt>HOD</dt><dd>{detail.hodName ?? '—'} {detail.hodEmail && `(${detail.hodEmail})`}</dd>
              <dt>Staff members</dt><dd>{staffMembers.filter(s => s.departmentId === detail.id).length}</dd>
              <dt>Verification</dt><dd><StatusBadge tone={statusTone(detail.verificationStatus)}>{detail.verificationStatus.replaceAll('_', ' ')}</StatusBadge></dd>
              <dt>Tenant ID</dt><dd className="u-mono u-xs">{detail.id}</dd>
            </div>
            <hr className="divider" />
            <h4 style={{ marginBottom: 8 }}>Staff in this department</h4>
            <table className="data-table" style={{ minWidth: 0 }}>
              <thead><tr><th>Name</th><th>Designation</th><th>Status</th></tr></thead>
              <tbody>
                {staffMembers.filter(s => s.departmentId === detail.id).map(s => (
                  <tr key={s.id}>
                    <td className="cell-main">{s.name}<div className="cell-sub">{s.email}</div></td>
                    <td>{s.designation}</td>
                    <td><StatusBadge tone={statusTone(s.verificationStatus)}>{s.verificationStatus.replaceAll('_', ' ')}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Modal>
    </>
  )
}
