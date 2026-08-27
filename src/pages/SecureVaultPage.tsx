import { useState } from 'react'
import { ShieldCheck, Lock, FileSignature, Eye, Ban, History } from 'lucide-react'
import { Card, CardHeader, CardBody, Button, SecurityBadge, StatusBadge, Modal, EmptyState } from '@/components/ui'
import { useToast } from '@/context/ToastContext'
import { papers, releases } from '@/data/demo'
import { formatDate } from '@/utils'

export default function SecureVaultPage() {
  const toast = useToast()
  const [requestOpen, setRequestOpen] = useState<string | null>(null)

  const vaulted = papers.filter(p => p.vault || p.status === 'IN_VAULT' || p.status === 'RELEASED' || p.status === 'ARCHIVED')

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Secure paper vault</h1>
          <p className="page-desc">
            Final approved papers are encrypted at rest, versioned and access-logged. Nothing leaves the vault before its scheduled release time.
          </p>
        </div>
        <span className="u-flex u-xs u-muted"><ShieldCheck size={14} /> Vault integrity verified 04:00 daily</span>
      </div>

      {vaulted.length === 0 ? (
        <Card><CardBody><EmptyState title="Vault is empty" description="Papers appear here after final university approval." /></CardBody></Card>
      ) : vaulted.map(p => (
        <Card key={p.id} style={{ marginBottom: 'var(--sp-3)' }}>
          <CardBody>
            <div className="vault-card" style={{ border: 'none', padding: 0, boxShadow: 'none', background: 'transparent' }}>
              <span className="vault-shield" aria-hidden><Lock size={20} /></span>
              <div style={{ flex: 1 }}>
                <div className="u-flex-between u-wrap">
                  <div>
                    <h3>{p.code}</h3>
                    <p className="u-sm u-muted">{p.title}</p>
                  </div>
                  <StatusBadge tone={statusToneSafe(p.status)}>{p.status.replaceAll('_', ' ')}</StatusBadge>
                </div>

                <div className="security-attrs">
                  <SecurityBadge label="AES-256-GCM" />
                  <SecurityBadge label="MFA required" />
                  <SecurityBadge label="Access logged" />
                  <SecurityBadge label={p.vault?.releaseLocked === false ? 'Release active' : 'Release locked'} locked={p.vault?.releaseLocked !== false} />
                  <SecurityBadge label="Watermarked on delivery" />
                </div>

                <hr className="divider" />
                <div className="kv-list">
                  <dt>Document hash</dt><dd><span className="hash-line">{p.vault?.documentHash ?? 'sha256:sealed'}</span></dd>
                  <dt>Signed by</dt><dd>{p.vault?.signedBy ?? '—'} {p.vault?.signedAt && <>· {formatDate(p.vault.signedAt)}</>}</dd>
                  <dt>Release window</dt>
                  <dd>
                    {(() => {
                      const rel = releases.find(r => r.paperId === p.id)
                      if (!rel) return 'Not scheduled'
                      return `${formatDate(rel.releaseAt, true)} (exam ${rel.examDate}, ${rel.examTime})`
                    })()}
                  </dd>
                  <dt>Access events</dt><dd>{p.vault?.accessLogCount ?? 0} logged entries — all successful accesses are attributable</dd>
                </div>

                <div className="page-actions" style={{ marginTop: 14 }}>
                  <Button variant="outline" disabled={!['UNIVERSITY_EXAM_CONTROLLER'].includes('') && p.vault?.releaseLocked !== false}
                    onClick={() => toast.push('info', 'Download blocked', 'This paper is locked until its scheduled release time. The attempt has been recorded as PAPER_ACCESS_DENIED.')}>
                    <Ban size={13} style={{ display: p.vault?.releaseLocked !== false ? 'inline' : 'none' }} />
                    <History size={13} style={{ display: p.vault?.releaseLocked !== false ? 'none' : 'inline' }} />
                    {p.vault?.releaseLocked !== false ? 'Download locked until release' : 'Download (released)'}
                  </Button>
                  <Button variant="ghost" onClick={() => setRequestOpen(p.id)}><Eye size={13} /> Request early access</Button>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}

      <Modal open={!!requestOpen} onClose={() => setRequestOpen(null)} title="Request early vault access"
        sub="Early access requires dual authorization and is always audited."
        footer={
          <>
            <Button variant="outline" onClick={() => setRequestOpen(null)}>Cancel</Button>
            <Button onClick={() => { setRequestOpen(null); toast.push('warning', 'Escalation created',
              'Dual-control request routed to University Exam Controller + Chief Custodian. Expect decision within exam policy SLA.') }}>
              Submit request
            </Button>
          </>
        }>
        <p className="u-sm">
          Opening a sealed paper before release defeats the examination integrity chain. Requests require:
        </p>
        <ul className="u-stack-2 u-md" style={{ marginTop: 10, paddingLeft: 18 }}>
          <li>Written justification recorded in the audit event</li>
          <li>Dual approval (Exam Controller + independent custodian)</li>
          <li>MFA re-challenge at access time</li>
          <li>Paper re-seal with new hash after any authorized inspection</li>
        </ul>
      </Modal>

      <Card>
        <CardBody className="u-xs u-muted u-flex">
          <FileSignature size={13} aria-hidden /> Digital signature note: each sealed record binds signer identity, role, timestamp and SHA-256 document hash.
          Any byte-level tampering invalidates the signature and raises a CRITICAL security event.
        </CardBody>
      </Card>
    </>
  )
}

function statusToneSafe(status: string): 'green' | 'blue' | 'gray' | 'amber' | 'red' {
  switch (status) {
    case 'RELEASED': return 'green'
    case 'IN_VAULT': return 'blue'
    case 'ARCHIVED': return 'gray'
    default: return 'amber'
  }
}
