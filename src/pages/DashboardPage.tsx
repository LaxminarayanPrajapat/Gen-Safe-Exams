import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Landmark, Building2, GitBranch, UserCheck, BookOpen, Database,
  FileStack, ClipboardCheck, ShieldAlert, Lock, Activity, ArrowRight,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  universities, colleges, departments, staffMembers, subjects,
  papers, auditEvents, securityEvents, platformStats,
} from '@/data/demo'
import { roleLabel } from '@/data/nav'
import { Card, CardHeader, CardBody, StatCard, StatusBadge, statusTone } from '@/components/ui'
import { formatDate, relativeTime } from '@/utils'

/* ---------- Simple SVG charts (no external deps) ---------- */
function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="chart-bars">
      {data.map((d, i) => (
        <div key={d.label} className="chart-bar-col">
          <span className="chart-bar-value">{d.value}</span>
          <div className={`chart-bar ${i === data.length - 1 ? 'navy' : ''}`} style={{ height: `${(d.value / max) * 100}%` }} />
          <span className="chart-bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

const donutPalette = ['#102A43', '#2F6B9A', '#287D5A', '#9A6B18', '#B5473C']

function Donut({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  let acc = 0
  const r = 42
  const c = 2 * Math.PI * r
  return (
    <div className="donut-wrap">
      <svg width={110} height={110} viewBox="0 0 110 110" role="img" aria-label="Difficulty distribution chart">
        <circle cx="55" cy="55" r={r} fill="none" stroke="var(--background)" strokeWidth="14" />
        {data.map((d, i) => {
          const frac = d.value / total
          const dash = `${frac * c} ${c}`
          const offset = -acc * c
          acc += frac
          return (
            <circle key={d.label} cx="55" cy="55" r={r} fill="none"
              stroke={donutPalette[i % donutPalette.length]} strokeWidth="14"
              strokeDasharray={dash} strokeDashoffset={offset} transform="rotate(-90 55 55)" />
          )
        })}
        <text x="55" y="53" textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--navy)">70</text>
        <text x="55" y="68" textAnchor="middle" fontSize="9" fill="var(--muted)">MARKS</text>
      </svg>
      <div className="legend">
        {data.map((d, i) => (
          <span key={d.label} className="legend-item">
            <span className="legend-swatch" style={{ background: donutPalette[i % donutPalette.length] }} />
            {d.label} · {Math.round((d.value / total) * 100)}%
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---------- Dashboard ---------- */
export default function DashboardPage() {
  const { user } = useAuth()

  const scope = useMemo(() => {
    switch (user?.role) {
      case 'SUPER_ADMIN': return { label: 'Platform overview', org: 'GEN SAFE EXAM Platform' }
      case 'UNIVERSITY_ADMIN': case 'UNIVERSITY_EXAM_CONTROLLER': case 'AUDITOR':
        return { label: user.role === 'AUDITOR' ? 'Audit & oversight view' : 'University overview', org: user.organizationName }
      case 'COLLEGE_ADMIN': case 'COLLEGE_EXAM_OFFICER': return { label: 'College overview', org: user.organizationName }
      default: return { label: 'Department workspace', org: user?.organizationName ?? '' }
    }
  }, [user])

  const pendingPapers = papers.filter(p => ['SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED'].includes(p.status))
  const vaulted = papers.filter(p => p.status === 'IN_VAULT' || p.status === 'RELEASED')
  const recentEvents = [...auditEvents].slice(0, 8)

  const pipelineStages = [
    { name: 'Question Bank', count: platformStats.questionBankSize, sub: `${subjects.length} subjects covered` },
    { name: 'Drafting', count: 1, sub: 'papers in draft' },
    { name: 'Department Review', count: pendingPapers.filter(p => p.approvals.length <= 1).length, sub: 'awaiting HOD', hot: true },
    { name: 'College Review', count: 1, sub: 'with exam officer' },
    { name: 'University Approval', count: papers.filter(p => p.approvals.length === 4).length ? 0 : 0, sub: 'queue empty' },
    { name: 'Secure Vault', count: vaulted.length, sub: 'release locked' },
  ]

  const monthlyPapers = [
    { label: 'Mar', value: 6 }, { label: 'Apr', value: 11 }, { label: 'May', value: 14 },
    { label: 'Jun', value: 4 }, { label: 'Jul', value: 7 }, { label: 'Aug', value: 12 },
  ]

  const isSecurityViewer = ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'AUDITOR'].includes(user?.role ?? '')

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>{scope.label}</h1>
          <p className="page-desc">
            {user?.organizationName} · signed in as <strong>{roleLabel[user!.role]}</strong>.
            AI-assisted generation with human approval at every stage.
          </p>
        </div>
        <div className="page-actions">
          {(user!.role === 'DEPARTMENT_STAFF' || user!.role === 'DEPARTMENT_HEAD') && (
            <Link to="/question-papers/create" className="btn btn-primary">Create question paper</Link>
          )}
          <Link to="/audit-log" className="btn btn-outline">Open audit log</Link>
        </div>
      </div>

      {/* KPI strip */}
      <div className="stat-grid" style={{ marginBottom: 'var(--sp-4)' }}>
        {user!.role === 'SUPER_ADMIN' && (
          <StatCard icon={Landmark} value={`${platformStats.activeUniversities}/${universities.length}`} label="Universities active" hint={`${platformStats.pendingUniversities} awaiting approval`} />
        )}
        {['SUPER_ADMIN', 'UNIVERSITY_ADMIN'].includes(user!.role) && (
          <StatCard icon={Building2} value={colleges.length} label="Colleges" hint="Shivaji University" />
        )}
        {!['DEPARTMENT_HEAD', 'DEPARTMENT_STAFF'].includes(user!.role) && (
          <StatCard icon={GitBranch} value={departments.length} label="Departments" hint="3 disciplines" />
        )}
        <StatCard icon={UserCheck} value={`${staffMembers.filter(s => s.verificationStatus === 'VERIFIED').length}/${staffMembers.length}`} label="Staff verified" tone="green" hint="HOD verification complete" />
        <StatCard icon={BookOpen} value={subjects.length} label="Subjects" hint="syllabus-approved" />
        <StatCard icon={Database} value={platformStats.questionBankSize} label="Question bank" hint="incl. AI-generated, reviewed" />
        <StatCard icon={FileStack} value={papers.length} label="Papers this cycle" hint="Winter 2026 window" />
        <StatCard icon={ClipboardCheck} value={platformStats.pendingApprovals} label="Pending approvals" tone="amber" hint="assigned to your queue" />
        {isSecurityViewer ? (
          <StatCard icon={ShieldAlert} value={securityEvents.filter(e => e.status !== 'RESOLVED' && e.status !== 'DISMISSED').length} label="Open security events" tone="red" hint="1 HIGH under investigation" />
        ) : (
          <StatCard icon={Lock} value={vaulted.length} label="Papers in vault" hint="AES-256 · access logged" />
        )}
      </div>

      <div className="dash-grid">
        {/* Left column */}
        <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
          <Card flush>
            <CardHeader title="Examination pipeline" sub="Winter 2026 examination cycle — Shivaji University"
              actions={<Link to="/question-papers" className="btn btn-ghost btn-sm">All papers <ArrowRight size={13} /></Link>} />
            <CardBody>
              <div className="pipeline-track">
                {pipelineStages.map(stage => (
                  <div key={stage.name} className={`pipeline-stage ${stage.hot ? 'hot' : ''}`}>
                    <div className="ps-name">{stage.name}</div>
                    <div className="ps-count">{stage.count}</div>
                    <div className="ps-sub">{stage.sub}</div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card flush>
            <CardHeader title="Approval queue" sub="Items requiring action in your authority chain"
              actions={<Link to="/approvals" className="btn btn-ghost btn-sm">Open approvals</Link>} />
            <table className="data-table" style={{ minWidth: 0 }}>
              <thead>
                <tr><th>Paper</th><th>Subject</th><th>Stage</th><th>Status</th><th>Waiting since</th></tr>
              </thead>
              <tbody>
                {pendingPapers.map(p => {
                  const lastStage = p.approvals[p.approvals.length - 1]
                  return (
                    <tr key={p.id}>
                      <td>
                        <Link to={`/question-papers/${p.id}`} className="cell-main">{p.code}</Link>
                        <div className="cell-sub">{p.title}</div>
                      </td>
                      <td>{p.subjectCode}</td>
                      <td>{lastStage.stage.replaceAll('_', ' ')}</td>
                      <td><StatusBadge tone={statusTone(p.status)}>{p.status.replaceAll('_', ' ')}</StatusBadge></td>
                      <td className="u-muted">{relativeTime(lastStage.timestamp)}</td>
                    </tr>
                  )
                })}
                {pendingPapers.length === 0 && (
                  <tr><td colSpan={5} className="u-center u-muted" style={{ padding: 20 }}>No items pending your approval.</td></tr>
                )}
              </tbody>
            </table>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-4)' }}>
            <Card>
              <CardHeader title="Papers generated" sub="Last 6 months — all institutions in scope" />
              <CardBody><BarChart data={monthlyPapers} /></CardBody>
            </Card>
            <Card>
              <CardHeader title="Blueprint difficulty mix" sub="Target vs achieved (QP-CSC502-W26-A)" />
              <CardBody>
                <Donut data={[
                  { label: 'Easy 29%', value: 29 },
                  { label: 'Medium 51%', value: 51 },
                  { label: 'Hard 20%', value: 20 },
                ]} />
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
          <Card>
            <CardHeader title="Security posture" actions={<Link to="/security" className="btn btn-ghost btn-sm">Details</Link>} />
            <CardBody style={{ paddingTop: 6 }}>
              <div className="posture-item"><span>MFA coverage</span><strong>78%</strong></div>
              <div className="posture-item"><span>Vault encryption</span><StatusBadge tone="green">AES-256-GCM</StatusBadge></div>
              <div className="posture-item"><span>Failed logins (24h)</span><strong>5</strong></div>
              <div className="posture-item"><span>Active sessions</span><strong>{platformStats.activeSessions}</strong></div>
              <div className="posture-item"><span>Release locks enforced</span><StatusBadge tone="blue">{vaulted.length} papers</StatusBadge></div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Recent activity" actions={<Activity size={15} color="var(--muted)" aria-hidden />} />
            <CardBody style={{ paddingTop: 4 }}>
              {recentEvents.map(e => (
                <div key={e.id} className="activity-row">
                  <span className="activity-dot" aria-hidden style={{
                    background: e.result === 'SUCCESS' ? 'var(--success)' : e.result === 'DENIED' ? 'var(--danger)' : 'var(--warning)',
                  }} />
                  <div style={{ flex: 1 }}>
                    <div className="u-bold" style={{ fontSize: 'var(--fs-md)' }}>{e.action.replaceAll('_', ' ')}</div>
                    <div className="u-xs u-muted">{e.actorName} · {relativeTime(e.timestamp)}</div>
                  </div>
                  <StatusBadge tone={statusTone(e.result)} dot={false}>{e.result}</StatusBadge>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Institution snapshot" />
            <CardBody style={{ display: 'grid', gap: 10 }}>
              {universities.filter(u => u.status === 'ACTIVE').map(u => (
                <div key={u.id} className="u-flex-between">
                  <span className="u-flex">
                    <Landmark size={14} color="var(--muted)" aria-hidden />
                    <span className="u-bold">{u.name}</span>
                  </span>
                  <span className="u-xs u-muted">since {formatDate(u.createdAt)}</span>
                </div>
              ))}
              {colleges.filter(c => c.universityId === 'univ-shivaji').map(c => (
                <div key={c.id} className="u-flex-between">
                  <span className="u-flex">
                    <Building2 size={14} color="var(--muted)" aria-hidden />
                    <span style={{ fontSize: 'var(--fs-md)' }}>{c.name.length > 34 ? c.code : c.name}</span>
                  </span>
                  <StatusBadge tone="green">ACTIVE</StatusBadge>
                </div>
              ))}
            </CardBody>
          </Card>

          {isSecurityViewer && (
            <Card>
              <CardHeader title="Latest security events" actions={<ShieldAlert size={15} color="var(--danger)" aria-hidden />} />
              <CardBody style={{ display: 'grid', gap: 10 }}>
                {securityEvents.slice(0, 3).map(e => (
                  <div key={e.id}>
                    <div className="u-flex-between">
                      <span className="risk-cell"><span className={`risk-pip risk-${e.riskLevel}`} />{e.type}</span>
                    </div>
                    <div className="u-xs u-muted" style={{ marginTop: 2 }}>{e.actorName} · {relativeTime(e.timestamp)} · {e.status}</div>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
