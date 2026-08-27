import { useState } from 'react'
import { KeyRound, MonitorSmartphone, ShieldCheck, Ban, Check } from 'lucide-react'
import { Card, CardHeader, CardBody, Button, FormField, Input, StatusBadge } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { roleLabel } from '@/data/nav'
import { initials, formatDate } from '@/utils'
import { sessions as seedSessions } from '@/data/demo'

export default function ProfilePage() {
  const toast = useToast()
  const { user } = useAuth()
  const [mfaOn, setMfaOn] = useState(user?.mfaEnabled ?? false)
  const mySessions = seedSessions.filter(s => s.userName === user?.name)

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Profile & security</h1>
          <p className="page-desc">Your identity within {user?.organizationName}. Security changes here are audited.</p>
        </div>
      </div>

      <div className="dash-grid">
        <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
          <Card>
            <CardBody>
              <div className="u-flex" style={{ gap: 14 }}>
                <span className="avatar lg" aria-hidden>{initials(user?.name ?? '')}</span>
                <div>
                  <h2 style={{ fontSize: 'var(--fs-lg)' }}>{user?.name}</h2>
                  <div className="u-sm u-muted">{user?.title}</div>
                  <div className="u-xs u-muted">{user?.email}</div>
                  <div className="u-flex" style={{ marginTop: 6 }}>
                    <StatusBadge tone="navy">{roleLabel[user!.role]}</StatusBadge>
                    <StatusBadge tone={user?.status === 'ACTIVE' ? 'green' : 'amber'}>{user?.status}</StatusBadge>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={<span className="u-flex"><KeyRound size={15} /> Change password</span>} />
            <CardBody>
              <form onSubmit={e => {
                e.preventDefault()
                toast.push('success', 'Password updated', 'All other sessions were signed out. PASSWORD_CHANGED audit event recorded.')
              }}>
                <FormField label="Current password" required><Input type="password" required autoComplete="current-password" /></FormField>
                <div className="form-row">
                  <FormField label="New password" required hint="Min 10 chars · mixed case · number · symbol"><Input type="password" required minLength={10} /></FormField>
                  <FormField label="Confirm new password" required><Input type="password" required minLength={10} /></FormField>
                </div>
                <Button type="submit">Update password</Button>
              </form>
            </CardBody>
          </Card>
        </div>

        <div style={{ display: 'grid', gap: 'var(--sp-4)', alignContent: 'start' }}>
          <Card>
            <CardHeader title={<span className="u-flex"><ShieldCheck size={15} /> Two-factor authentication</span>} sub={mfaOn ? 'TOTP authenticator enrolled' : 'Strongly recommended for exam roles'} />
            <CardBody>
              <label className="checkbox-row">
                <input type="checkbox" checked={mfaOn} onChange={() => {
                  setMfaOn(v => !v)
                  toast.push(mfaOn ? 'warning' : 'success', mfaOn ? 'MFA disabled' : 'MFA enabled',
                    mfaOn ? 'Your next sign-in will not require a second factor. This weakens protection and is audited.' : 'Scan the QR code in your authenticator app to complete enrolment (demo).')
                }} />
                Require a verification code at every sign-in
              </label>
              {mfaOn && (
                <div className="alert-banner success" style={{ marginTop: 12 }}>
                  <Check size={15} aria-hidden /> Enrolled device: Authenticator App (iPhone) — recovery codes generated 02 Jun 2026.
                </div>
              )}
            </CardBody>
          </Card>

          <Card flush>
            <CardHeader title={<span className="u-flex"><MonitorSmartphone size={15} /> My sessions</span>} />
            <table className="data-table" style={{ minWidth: 0 }}>
              <thead><tr><th>Device</th><th>Started</th><th></th></tr></thead>
              <tbody>
                {mySessions.map(s => (
                  <tr key={s.id}>
                    <td className="cell-main">{s.device}<div className="cell-sub u-mono u-xs">{s.ip} {s.current && '· this device'}</div></td>
                    <td>{formatDate(s.startedAt)}</td>
                    <td style={{ textAlign: 'right' }}>
                      {!s.current && (
                        <button className="icon-btn" title="Revoke session" onClick={() => toast.push('info', 'Session revoked')}>
                          <Ban size={13} color="var(--danger)" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {mySessions.length === 0 && (
                  <tr><td colSpan={3} className="u-center u-muted" style={{ padding: 16 }}>No other active sessions.</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </>
  )
}
