import { useState } from 'react'
import {
  ShieldCheck, ShieldAlert, KeyRound, LockKeyhole, MonitorSmartphone,
  LogIn, Ban,
} from 'lucide-react'
import {
  Card, CardHeader, CardBody, StatCard, StatusBadge, Tabs, Button,
  DataTable, FilterBar,
} from '@/components/ui'
import type { Column } from '@/components/ui/DataTable'
import { Select } from '@/components/ui/FormControls'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/context/ToastContext'
import { securityEvents as seedEvents, sessions as seedSessions, platformStats } from '@/data/demo'
import type { SecurityEvent, ActiveSession } from '@/types'
import { relativeTime, formatDate } from '@/utils'

export default function SecurityPage() {
  const toast = useToast()
  const [events, setEvents] = useState<SecurityEvent[]>(seedEvents)
  const [sessions, setSessions] = useState<ActiveSession[]>(seedSessions)
  const [tab, setActive] = useState('posture')
  const [riskF, setRiskF] = useState('')
  const [detail, setDetail] = useState<SecurityEvent | null>(null)

  const filtered = events.filter(e => !riskF || e.riskLevel === riskF)

  const eventColumns: Column<SecurityEvent>[] = [
    {
      key: 'type', header: 'Event',
      render: e => (
        <span className="risk-cell">
          <span className={`risk-pip risk-${e.riskLevel}`} aria-hidden />
          <span><span className="cell-main">{e.type}</span>
            <div className="cell-sub" style={{ maxWidth: 420 }}>{e.description.length > 110 ? `${e.description.slice(0, 110)}…` : e.description}</div>
          </span>
        </span>
      ),
    },
    { key: 'actor', header: 'Actor', render: e => <>{e.actorName}<div className="cell-sub u-mono u-xs">{e.ip}</div></> },
    { key: 'when', header: 'When', render: e => <span title={formatDate(e.timestamp)}>{relativeTime(e.timestamp)}</span> },
    {
      key: 'risk', header: 'Risk',
      render: e => <StatusBadge tone={e.riskLevel === 'CRITICAL' || e.riskLevel === 'HIGH' ? 'red' : e.riskLevel === 'MEDIUM' ? 'amber' : 'green'}>{e.riskLevel}</StatusBadge>,
    },
    { key: 'status', header: 'Case status', render: e => <StatusBadge tone={statusToneSafe(e.status)}>{e.status.replaceAll('_', ' ')}</StatusBadge> },
    {
      key: 'act', header: '', align: 'right',
      render: e => (
        <div className="row-actions">
          {e.status !== 'RESOLVED' && (
            <button className="icon-btn" title="Mark resolved" onClick={() => resolve(e)}>
              <ShieldCheck size={15} color="var(--success)" />
            </button>
          )}
          <button className="icon-btn" title="Open case file" onClick={() => setDetail(e)}><ShieldAlert size={15} /></button>
        </div>
      ),
    },
  ]

  const sessionColumns: Column<ActiveSession>[] = [
    { key: 'user', header: 'User', render: s => <span className="cell-main">{s.userName}<div className="cell-sub">{s.role.replaceAll('_', ' ')}</div></span> },
    { key: 'device', header: 'Device / IP', render: s => <>{s.device}<div className="cell-sub u-mono u-xs">{s.ip}</div></> },
    { key: 'mfa', header: 'MFA', render: s => <StatusBadge tone={s.mfa ? 'green' : 'amber'}>{s.mfa ? 'Enforced' : 'Missing'}</StatusBadge> },
    { key: 'start', header: 'Started', render: s => formatDate(s.startedAt) },
    { key: 'active', header: 'Last active', render: s => s.current ? <span className="badge badge-green">This device</span> : relativeTime(s.lastActiveAt) },
    {
      key: 'revoke', header: '', align: 'right',
      render: s => (
        <div className="row-actions">
          {!s.current && (
            <button className="icon-btn" title="Revoke session"
              onClick={() => {
                setSessions(prev => prev.filter(x => x.id !== s.id))
                toast.push('warning', 'Session revoked', `${s.userName} signed out remotely. SESSION_REVOKED audit event recorded.`)
              }}>
              <Ban size={14} color="var(--danger)" />
            </button>
          )}
        </div>
      ),
    },
  ]

  const resolve = (e: SecurityEvent) => setEvents(prev => prev.map(x => x.id === e.id ? { ...x, status: 'RESOLVED' } : x))

  const mfaPct = platformStats.mfaCoveragePct

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Security monitoring</h1>
          <p className="page-desc">
            Focused on examination integrity: least privilege, traceability and anomaly detection — not surveillance of routine academic work.
          </p>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 'var(--sp-4)' }}>
        <StatCard icon={KeyRound} value={`${mfaPct}%`} label="MFA coverage" hint="target ≥ 90% for exam roles" tone={mfaPct >= 90 ? 'green' : 'amber'} />
        <StatCard icon={LockKeyhole} value="AES-256-GCM" label="Vault encryption" hint="integrity check passed" tone="green" />
        <StatCard icon={MonitorSmartphone} value={sessions.length} label="Active sessions" hint={`${sessions.filter(s => !s.mfa).length} without MFA`} />
        <StatCard icon={LogIn} value={platformStats.failedLogins24h} label="Failed logins (24h)" hint="LOCK-5 rule armed" tone="amber" />
        <StatCard icon={ShieldAlert} value={events.filter(e => e.status === 'OPEN' || e.status === 'INVESTIGATING').length} label="Open events" hint="1 HIGH under investigation" tone="red" />
      </div>

      <Tabs active={tab} onChange={setActive} tabs={[
        { id: 'events', label: 'Security events', count: filtered.length },
        { id: 'sessions', label: 'Session management', count: sessions.length },
        { id: 'rules', label: 'Detection rules' },
      ]} />

      {tab === 'events' && (
        <>
          <FilterBar>
            <Select value={riskF} onChange={e => setRiskF(e.target.value)} aria-label="Filter risk level"
              options={[{ value: '', label: 'All risk levels' }, 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']} />
            <div className="spacer" />
            <span className="u-xs u-muted">Escalation: 5 failed logins → temporary lock · multi-IP sign-in → alert · bulk download → block + review</span>
          </FilterBar>
          <DataTable columns={eventColumns} rows={filtered} rowKey={e => e.id}
            emptyState={<p className="u-center u-muted" style={{ padding: 32 }}>No events match this filter.</p>} />
        </>
      )}

      {tab === 'sessions' && (
        <>
          <DataTable columns={sessionColumns} rows={sessions} rowKey={s => s.id} />
          <p className="u-xs u-muted" style={{ marginTop: 10 }}>
            Idle sessions expire after 30 minutes; absolute session lifetime is 12 hours. Token rotation occurs on privilege-sensitive actions.
          </p>
        </>
      )}

      {tab === 'rules' && (
        <div className="dash-grid">
          <Card flush>
            <CardHeader title="Automated detection rules" sub="Proportionate controls for examination integrity" />
            <table className="data-table" style={{ minWidth: 0 }}>
              <thead><tr><th>Rule</th><th>Trigger</th><th>Action</th><th>Risk</th></tr></thead>
              <tbody>
                <tr><td className="cell-main">LOCK-5</td><td>5 consecutive failed logins</td><td>Temporary account lock (15 min)</td><td><StatusBadge tone="amber">MEDIUM</StatusBadge></td></tr>
                <tr><td className="cell-main">IP-SPREAD</td><td>Same account, distant IPs &lt; 60 min</td><td>Invalidate sessions + CRITICAL alert</td><td><StatusBadge tone="red">CRITICAL</StatusBadge></td></tr>
                <tr><td className="cell-main">VAULT-EARLY</td><td>Vaulted paper access before release</td><td>Deny + HIGH event + notify custodian</td><td><StatusBadge tone="red">HIGH</StatusBadge></td></tr>
                <tr><td className="cell-main">BULK-DL</td><td>&gt; 5 downloads in 5 minutes</td><td>Block + require custodian review</td><td><StatusBadge tone="red">HIGH</StatusBadge></td></tr>
                <tr><td className="cell-main">OFF-HOURS</td><td>Paper access outside activity window</td><td>LOW flag for routine review</td><td><StatusBadge tone="green">LOW</StatusBadge></td></tr>
              </tbody>
            </table>
          </Card>
          <Card>
            <CardHeader title="Control principles" />
            <CardBody className="u-stack-4 u-sm">
              <p><strong>Least privilege.</strong> Roles carry explicit permissions; no staff account can finalize or release a paper.</p>
              <p><strong>Tenant isolation.</strong> Every query is organization-scoped; cross-tenant reads are impossible without an audited SUPER_ADMIN context.</p>
              <p><strong>Traceability over surveillance.</strong> We log who accessed what paper when — not personal activity beyond security need.</p>
              <Button variant="outline" onClick={() => toast.push('info', 'Report queued', 'A signed security posture report (PDF) will be generated for your institution.')}>
                Export posture report
              </Button>
            </CardBody>
          </Card>
        </div>
      )}

      <Modal open={!!detail} onClose={() => setDetail(null)} wide
        title={detail?.type ?? ''} sub={`Risk ${detail?.riskLevel ?? ''} · case ${detail?.id.toUpperCase()}`}>
        {detail && (
          <>
            <div className="alert-banner danger" style={{ marginBottom: 14 }}><ShieldAlert size={15} aria-hidden /> {detail.description}</div>
            <div className="kv-list">
              <dt>Actor</dt><dd>{detail.actorName} <span className="u-mono u-xs">({detail.ip})</span></dd>
              <dt>Timestamp</dt><dd>{formatDate(detail.timestamp, true)}</dd>
              <dt>Status</dt><dd><StatusBadge tone={statusToneSafe(detail.status)}>{detail.status.replaceAll('_', ' ')}</StatusBadge></dd>
              <dt>Related entity</dt><dd>{detail.relatedEntity ?? '—'}</dd>
            </div>
          </>
        )}
      </Modal>
    </>
  )
}

function statusToneSafe(status: string): 'green' | 'amber' | 'blue' | 'gray' {
  switch (status) {
    case 'RESOLVED': return 'green'
    case 'INVESTIGATING': return 'blue'
    case 'OPEN': return 'amber'
    default: return 'gray'
  }
}
