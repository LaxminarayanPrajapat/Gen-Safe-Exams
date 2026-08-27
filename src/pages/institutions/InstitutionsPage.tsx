import { Link } from 'react-router-dom'
import { Landmark, Building2, GitBranch, Users, ShieldCheck } from 'lucide-react'
import { Card, CardHeader, CardBody, StatusBadge } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { universities, colleges, departments, staffMembers } from '@/data/demo'

export default function InstitutionsPage() {
  const { user } = useAuth()

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Institution hierarchy</h1>
          <p className="page-desc">
            Every account, subject and paper belongs to exactly one organization path.
            Tenant isolation is enforced at the API layer — a college can never read another college's data.
          </p>
        </div>
        <Link to="/universities" className="btn btn-outline">Manage universities</Link>
      </div>

      <Card style={{ marginBottom: 'var(--sp-4)' }}>
        <CardHeader title="Chain of authority" sub="Registration and verification follow the institutional hierarchy" />
        <CardBody>
          <div className="hierarchy-flow" role="list">
            {[
              { role: 'Super Admin', desc: 'Registers universities', accent: true },
              { role: 'University', desc: 'Registers colleges' },
              { role: 'College', desc: 'Creates departments' },
              { role: 'Department Head', desc: 'Verifies staff' },
              { role: 'Department Staff', desc: 'Builds question banks & papers' },
            ].map(n => (
              <div key={n.role} className={`hierarchy-node ${n.accent ? 'accent' : ''}`} role="listitem">
                <div className="hn-role">{n.role}</div>
                <div className="hn-desc">{n.desc}</div>
              </div>
            ))}
          </div>
          <hr className="divider" />
          <div className="alert-banner info">
            <ShieldCheck size={15} aria-hidden />
            Examination approval adds four more gates after drafting: Department Head → College Exam Officer → University Exam Controller → Secure Vault → Scheduled release.
          </div>
        </CardBody>
      </Card>

      {user?.role === 'SUPER_ADMIN' && (
        <div className="stat-grid" style={{ marginBottom: 'var(--sp-4)' }}>
          {universities.map(u => (
            <Card key={u.id}>
              <CardBody>
                <div className="u-flex-between" style={{ marginBottom: 8 }}>
                  <span className="u-flex"><Landmark size={16} color="var(--navy)" aria-hidden /><strong>{u.name}</strong></span>
                  <StatusBadge tone={u.status === 'ACTIVE' ? 'green' : 'amber'}>{u.status.replaceAll('_', ' ')}</StatusBadge>
                </div>
                <div className="u-xs u-muted">{u.location} · est. {u.establishedYear}</div>
                <div className="u-xs u-muted">Admin: {u.adminName}</div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <div className="dash-grid">
        <Card flush>
          <CardHeader title="Colleges under your scope"
            actions={<Link to="/colleges" className="btn btn-ghost btn-sm">Open</Link>} />
          <table className="data-table" style={{ minWidth: 0 }}>
            <thead><tr><th>College</th><th>Code</th><th>Status</th></tr></thead>
            <tbody>
              {(user?.role === 'COLLEGE_ADMIN' || user?.role === 'DEPARTMENT_HEAD'
                ? colleges.filter(c => c.id === user.organizationId)
                : colleges
              ).map(c => (
                <tr key={c.id}>
                  <td className="cell-main">{c.name}<div className="cell-sub">{c.universityName}</div></td>
                  <td className="u-mono">{c.code}</td>
                  <td><StatusBadge tone={statusToneSafe(c.status)}>{c.status.replaceAll('_', ' ')}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card flush>
          <CardHeader title="Departments"
            actions={<Link to="/departments" className="btn btn-ghost btn-sm">Open</Link>} />
          <table className="data-table" style={{ minWidth: 0 }}>
            <thead><tr><th>Department</th><th>HOD</th><th>Verification</th></tr></thead>
            <tbody>
              {(user?.role === 'DEPARTMENT_HEAD' || user?.role === 'DEPARTMENT_STAFF'
                ? departments.filter(d => d.id === user.organizationId)
                : departments.filter(d => colleges.some(c => c.id === d.collegeId))
              ).map(d => (
                <tr key={d.id}>
                  <td className="cell-main">{d.name}<div className="cell-sub"><GitBranch size={10} aria-hidden /> {d.collegeName.length > 30 ? d.code : d.collegeName}</div></td>
                  <td className="cell-sub">{d.hodName ?? '—'}</td>
                  <td><StatusBadge tone={statusToneSafe(d.verificationStatus)}>{d.verificationStatus.replaceAll('_', ' ')}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card style={{ marginTop: 'var(--sp-4)' }} flush>
        <CardHeader title="Staff verification overview" sub="Staff become ACTIVE only after department-head verification"
          actions={<Link to="/staff" className="btn btn-ghost btn-sm"><Users size={13} /> Manage staff</Link>} />
        <table className="data-table">
          <thead><tr><th>Staff member</th><th>Department</th><th>Designation</th><th>Status</th></tr></thead>
          <tbody>
            {staffMembers.slice(0, 6).map(s => (
              <tr key={s.id}>
                <td className="cell-main">{s.name}<div className="cell-sub">{s.email}</div></td>
                <td>{s.departmentName}</td>
                <td>{s.designation}</td>
                <td><StatusBadge tone={statusToneSafe(s.verificationStatus)}>{s.verificationStatus.replaceAll('_', ' ')}</StatusBadge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}

function statusToneSafe(status: string): 'green' | 'amber' | 'red' | 'blue' | 'gray' {
  switch (status) {
    case 'ACTIVE': case 'VERIFIED': return 'green'
    case 'PENDING': case 'PENDING_APPROVAL': case 'UNDER_REVIEW': return 'amber'
    case 'REJECTED': case 'SUSPENDED': case 'REVOKED': return 'red'
    default: return 'gray'
  }
}
