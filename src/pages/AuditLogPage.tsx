import { useMemo, useState } from 'react'
import { Download, ScrollText } from 'lucide-react'
import {
  StatusBadge, statusTone, DataTable, FilterBar, SearchInput, Drawer, Button,
} from '@/components/ui'
import type { Column } from '@/components/ui/DataTable'
import { Pagination, usePagedRows } from '@/components/ui/DataTable'
import { Select } from '@/components/ui/FormControls'
import { useToast } from '@/context/ToastContext'
import { auditEvents as seed } from '@/data/demo'
import type { AuditEvent } from '@/types'
import { formatDate, relativeTime, downloadCsv } from '@/utils'

export default function AuditLogPage() {
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [actionF, setActionF] = useState('')
  const [resultF, setResultF] = useState('')
  const [detail, setDetail] = useState<AuditEvent | null>(null)

  const actions = useMemo(() => Array.from(new Set(seed.map(e => e.action))).sort(), [])

  const filtered = useMemo(() => seed.filter(e =>
    (!search || e.actorName.toLowerCase().includes(search.toLowerCase()) || e.targetId.toLowerCase().includes(search.toLowerCase()) || e.id.includes(search)) &&
    (!actionF || e.action === actionF) &&
    (!resultF || e.result === resultF),
  ), [search, actionF, resultF])

  const { page, setPage, paged, total } = usePagedRows(filtered, 12)

  const columns: Column<AuditEvent>[] = [
    { key: 'id', header: 'Event ID', render: e => <span className="u-mono u-xs">{e.id}</span> },
    { key: 'actor', header: 'Actor', render: e => <span className="cell-main">{e.actorName}<div className="cell-sub">{e.actorRole.replaceAll('_', ' ')}</div></span> },
    { key: 'org', header: 'Organization', render: e => <span className="u-xs">{e.organizationName}</span> },
    { key: 'action', header: 'Action', render: e => <span className="u-mono u-xs u-bold">{e.action}</span> },
    { key: 'target', header: 'Target', render: e => <span className="u-xs">{e.targetType}<div className="cell-sub u-mono">{e.targetId}</div></span> },
    { key: 'when', header: 'Timestamp', render: e => <span title={formatDate(e.timestamp, true)}>{relativeTime(e.timestamp)}</span> },
    { key: 'ip', header: 'Source', render: e => <span className="u-mono u-xs">{e.ip}<div className="cell-sub">{e.device.split(' / ')[0]}</div></span> },
    { key: 'result', header: 'Result', render: e => <StatusBadge tone={statusTone(e.result)}>{e.result}</StatusBadge> },
    {
      key: 'open', header: '', align: 'right',
      render: e => (
        <div className="row-actions">
          <button className="icon-btn" title="Inspect event" onClick={() => setDetail(e)}><ScrollText size={14} /></button>
        </div>
      ),
    },
  ]

  const exportCsv = () => {
    downloadCsv(`gse-audit-${new Date().toISOString().slice(0, 10)}.csv`, [
      ['event_id', 'timestamp', 'actor', 'role', 'organization', 'action', 'target_type', 'target_id', 'ip', 'result'],
      ...filtered.map(e => [e.id, e.timestamp, e.actorName, e.actorRole, e.organizationName, e.action, e.targetType, e.targetId, e.ip, e.result]),
    ])
    toast.push('success', 'Export generated', `${filtered.length} events exported. AUDIT_EXPORTED event appended to the log.`)
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Audit log</h1>
          <p className="page-desc">
            Append-only trail of every sensitive action. Events are tenant-scoped and cannot be edited or deleted by any role.
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv}><Download size={14} /> Export CSV</Button>
      </div>

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search actor, target or event ID…" width={280} />
        <Select value={actionF} onChange={e => setActionF(e.target.value)} aria-label="Action"
          options={[{ value: '', label: 'All actions' }, ...actions]} />
        <Select value={resultF} onChange={e => setResultF(e.target.value)} aria-label="Result"
          options={[{ value: '', label: 'All results' }, 'SUCCESS', 'FAILURE', 'DENIED']} />
        <div className="spacer" />
        <span className="u-xs u-muted">{filtered.length} events</span>
      </FilterBar>

      <DataTable columns={columns} rows={paged} rowKey={e => e.id} />
      <div className="table-footer" style={{ marginTop: 10 }}>
        <Pagination page={page} pageSize={12} total={total} onPage={setPage} />
      </div>

      <Drawer open={!!detail} onClose={() => setDetail(null)} title={`Event ${detail?.id ?? ''}`}
        sub={`${detail?.action.replaceAll('_', ' ') ?? ''} · ${detail?.result}`}>
        {detail && (
          <>
            <div className="kv-list" style={{ marginBottom: 16 }}>
              <dt>Actor</dt><dd>{detail.actorName} ({detail.actorRole.replaceAll('_', ' ')})</dd>
              <dt>Organization</dt><dd>{detail.organizationName}</dd>
              <dt>Target</dt><dd>{detail.targetType} · <span className="u-mono">{detail.targetId}</span></dd>
              <dt>Timestamp</dt><dd>{formatDate(detail.timestamp, true)}</dd>
              <dt>IP address</dt><dd className="u-mono">{detail.ip}</dd>
              <dt>Device</dt><dd>{detail.device}</dd>
              <dt>Result</dt><dd><StatusBadge tone={statusTone(detail.result)}>{detail.result}</StatusBadge></dd>
            </div>
            <h4 style={{ marginBottom: 8 }}>Stored payload (excerpt)</h4>
            <pre className="hash-line" style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify({
              event_id: detail.id,
              actor_id: detail.actorId,
              organization_id: detail.organizationId,
              action: detail.action,
              target: { type: detail.targetType, id: detail.targetId },
              ts: detail.timestamp,
              network: { ip: detail.ip },
              session: { device: detail.device },
              result: detail.result,
              chain_hash: `sha256:${detail.id}${detail.timestamp}`.slice(0, 34) + '…',
            }, null, 2)}</pre>
          </>
        )}
      </Drawer>
    </>
  )
}
