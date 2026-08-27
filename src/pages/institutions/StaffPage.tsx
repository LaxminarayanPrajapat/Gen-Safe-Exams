import { useState } from 'react'
import { UserPlus, CheckCircle2, XCircle, Eye, Mail } from 'lucide-react'
import { StatusBadge, statusTone, DataTable } from '@/components/ui'
import type { Column } from '@/components/ui/DataTable'
import { Modal, ConfirmationDialog } from '@/components/ui/Modal'
import { FormField, Input, Select } from '@/components/ui/FormControls'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { Timeline } from '@/components/ui/Timeline'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'
import { staffMembers as seed, departments } from '@/data/demo'
import type { StaffMember } from '@/types'
import { formatDate, initials } from '@/utils'

export default function StaffPage() {
  const toast = useToast()
  const { user } = useAuth()
  const isHod = user?.role === 'DEPARTMENT_HEAD'

  // Tenant scope: department staff lists for HODs; college-wide for college roles.
  const visible =
    isHod ? seed.filter(s => s.departmentId === user!.organizationId)
      : user?.role === 'COLLEGE_ADMIN' || user?.role === 'COLLEGE_EXAM_OFFICER'
        ? seed.filter(s => departments.find(d => d.id === s.departmentId)?.collegeId === user.organizationId)
        : seed

  const [rows, setRows] = useState<StaffMember[]>(visible)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteResult, setInviteResult] = useState<{ name: string; token: string } | null>(null)
  const [detail, setDetail] = useState<StaffMember | null>(null)
  const [rejectTarget, setRejectTarget] = useState<StaffMember | null>(null)
  const [form, setForm] = useState({ name: '', email: '', designation: 'Assistant Professor', departmentId: '' })

  const canInvite = ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'DEPARTMENT_HEAD'].includes(user?.role ?? '')
  const canVerify = isHod

  const columns: Column<StaffMember>[] = [
    {
      key: 'name', header: 'Staff member',
      render: s => (
        <span className="u-flex">
          <span className="avatar" aria-hidden>{initials(s.name)}</span>
          <span>
            <span className="cell-main">{s.name}</span>
            <div className="cell-sub">{s.email} · {s.employeeId}</div>
          </span>
        </span>
      ),
    },
    { key: 'dept', header: 'Department', render: s => s.departmentName.length > 26 ? s.departmentName.split(' ').map(w => w[0]).join('') : s.departmentName },
    { key: 'designation', header: 'Designation', render: s => s.designation },
    { key: 'invited', header: 'Invited by', render: s => <>{s.invitedBy}<div className="cell-sub">{formatDate(s.invitedAt)}</div></> },
    {
      key: 'verified', header: 'Verified by',
      render: s => s.verifiedBy
        ? <>{s.verifiedBy}<div className="cell-sub">{formatDate(s.verifiedAt ?? '')}</div></>
        : <span className="u-muted">—</span>,
    },
    { key: 'status', header: 'Verification', render: s => <StatusBadge tone={statusTone(s.verificationStatus)}>{s.verificationStatus.replaceAll('_', ' ')}</StatusBadge> },
    {
      key: 'actions', header: '', align: 'right',
      render: s => (
        <div className="row-actions">
          <button className="icon-btn" title="View verification history" onClick={() => setDetail(s)}><Eye size={15} /></button>
          {canVerify && s.verificationStatus === 'PENDING' && (
            <>
              <button className="icon-btn" title="Verify staff member" onClick={() => verify(s)}><CheckCircle2 size={15} color="var(--success)" /></button>
              <button className="icon-btn" title="Reject application" onClick={() => setRejectTarget(s)}><XCircle size={15} color="var(--danger)" /></button>
            </>
          )}
        </div>
      ),
    },
  ]

  const invite = (e: React.FormEvent) => {
    e.preventDefault()
    const dept = departments.find(d => d.id === form.departmentId) ?? departments[0]
    const token = `GSE-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${new Date().getFullYear()}`
    setRows([{
      id: `st-${Date.now()}`, employeeId: `${dept.code}-NEW`, name: form.name, email: form.email,
      departmentId: dept.id, departmentName: dept.name, designation: form.designation,
      role: 'DEPARTMENT_STAFF', verificationStatus: 'PENDING',
      invitedBy: user?.name ?? 'Administrator', invitedAt: new Date().toISOString(),
    }, ...rows])
    setInviteOpen(false)
    setInviteResult({ name: form.name, token })
    toast.push('success', 'Invitation sent', `Official invitation emailed to ${form.email}. STAFF_INVITED audit event recorded.`)
    setForm({ name: '', email: '', designation: 'Assistant Professor', departmentId: '' })
  }

  const verify = (s: StaffMember) => {
    setRows(rows.map(r => r.id === s.id ? { ...r, verificationStatus: 'VERIFIED', verifiedBy: user?.name ?? 'HOD', verifiedAt: new Date().toISOString() } : r))
    toast.push('success', 'Staff verified', `${s.name} is now ACTIVE with department scope. STAFF_VERIFIED audit event stored.`)
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Staff</h1>
          <p className="page-desc">
            Staff cannot self-register. Accounts are created via official invitation and become ACTIVE only after
            Department Head (and where required, higher authority) verification.
          </p>
        </div>
        {canInvite && (
          <Button onClick={() => setInviteOpen(true)}><UserPlus size={14} /> Invite staff</Button>
        )}
      </div>

      <DataTable columns={columns} rows={rows} rowKey={s => s.id} />

      {/* Invite modal */}
      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite staff member"
        sub="An invitation email with a single-use enrolment token will be sent to the official address."
        footer={
          <>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" form="invite-staff">Send invitation</Button>
          </>
        }>
        <form id="invite-staff" onSubmit={invite}>
          <FormField label="Full name" required htmlFor="st-name">
            <Input id="st-name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Prof. Full Name" />
          </FormField>
          <FormField label="Official email" required hint="Personal email addresses are rejected by policy.">
            <Input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="name@college.edu.in" />
          </FormField>
          <div className="form-row">
            <FormField label="Department" required>
              <Select required value={form.departmentId} aria-label="Department"
                onChange={e => setForm({ ...form, departmentId: e.target.value })}
                options={[{ value: '', label: 'Select department' }, ...departments.map(d => ({ value: d.id, label: d.name }))]} />
            </FormField>
            <FormField label="Designation" required>
              <Select value={form.designation} aria-label="Designation"
                onChange={e => setForm({ ...form, designation: e.target.value })}
                options={['Assistant Professor', 'Associate Professor', 'Professor', 'Lab Assistant']} />
            </FormField>
          </div>
          <div className="alert-banner info"><Mail size={15} aria-hidden /> The invited staff member submits identity & employment details during enrolment; your Head verifies before activation.</div>
        </form>
      </Modal>

      {/* Invite result */}
      <Modal open={!!inviteResult} onClose={() => setInviteResult(null)} title="Invitation created"
        sub="Share the enrolment token only through the official channel."
        footer={<Button onClick={() => setInviteResult(null)}>Done</Button>}>
        {inviteResult && (
          <>
            <p style={{ marginBottom: 12 }}>
              Invitation for <strong>{inviteResult.name}</strong> has been queued for delivery.
              Single-use enrolment token:
            </p>
            <div className="hash-line">{inviteResult.token}</div>
            <div className="alert-banner warning" style={{ marginTop: 14 }}>
              Tokens expire in 72 hours and bind to the exact email address. Failed attempts are rate-limited and audited.
            </div>
          </>
        )}
      </Modal>

      {/* Verification detail */}
      <Drawer open={!!detail} onClose={() => setDetail(null)}
        title={detail?.name ?? ''} sub={`${detail?.designation ?? ''} · ${detail?.departmentName ?? ''}`}
        footer={canVerify && detail?.verificationStatus === 'PENDING' ? (
          <>
            <Button variant="danger-outline" onClick={() => { setRejectTarget(detail!); setDetail(null) }}>Reject</Button>
            <Button variant="success" onClick={() => { verify(detail!); setDetail(null) }}><CheckCircle2 size={14} /> Verify staff member</Button>
          </>
        ) : undefined}>
        {detail && (
          <>
            <h4 style={{ marginBottom: 10 }}>Identity record</h4>
            <div className="kv-list" style={{ marginBottom: 18 }}>
              <dt>Email</dt><dd>{detail.email}</dd>
              <dt>Employee ID</dt><dd className="u-mono">{detail.employeeId}</dd>
              <dt>Status</dt><dd><StatusBadge tone={statusTone(detail.verificationStatus)}>{detail.verificationStatus.replaceAll('_', ' ')}</StatusBadge></dd>
              <dt>Platform role</dt><dd>{detail.role.replaceAll('_', ' ')}</dd>
              <dt>Tenant scope</dt><dd>{detail.departmentName}</dd>
            </div>
            <h4 style={{ marginBottom: 10 }}>Immutable verification trail</h4>
            <Timeline entries={[
              ...(detail.verifiedAt ? [{
                id: `${detail.id}-v`, state: 'done' as const,
                title: 'STAFF_VERIFIED',
                meta: `${detail.verifiedBy} · DEPARTMENT_HEAD · ${formatDate(detail.verifiedAt!, true)}`,
                body: 'Employment records checked against institute register. Identity documents matched.',
              }] : []),
              {
                id: `${detail.id}-i`, state: detail.verifiedAt ? 'done' : 'current',
                title: 'STAFF_INVITED / STAFF_REGISTERED',
                meta: `${detail.invitedBy} · ${formatDate(detail.invitedAt, true)}`,
                body: 'Official email invitation issued; account created with PENDING status.',
              },
            ]} />
          </>
        )}
      </Drawer>

      <ConfirmationDialog open={!!rejectTarget} onClose={() => setRejectTarget(null)}
        onConfirm={() => {
          if (!rejectTarget) return
          setRows(rows.map(r => r.id === rejectTarget.id ? { ...r, verificationStatus: 'REJECTED' } : r))
          toast.push('warning', 'Application rejected', `${rejectTarget.name}'s account remains disabled. STAFF_REJECTED audit event recorded.`)
        }}
        tone="danger" confirmLabel="Reject application"
        title={`Reject ${rejectTarget?.name ?? ''}?`}
        message="The account will remain permanently disabled for this enrolment cycle. A new invitation would be required. This decision is recorded as an immutable audit event." />
    </>
  )
}
