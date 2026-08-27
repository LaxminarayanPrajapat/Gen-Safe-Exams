import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Button } from '@/components/ui/Button'
import { FormField, Input } from '@/components/ui/FormControls'

function strength(pw: string): { score: number; label: string; tone: 'red' | 'amber' | 'green' } {
  let score = 0
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return {
    score,
    label: ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][score],
    tone: score <= 1 ? 'red' : score === 2 ? 'amber' : 'green',
  }
}

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pw.length < 10) { setError('Password must be at least 10 characters.'); return }
    if (pw !== confirm) { setError('Passwords do not match.'); return }
    navigate('/login', { replace: true })
  }

  const s = strength(pw)

  return (
    <AuthLayout>
      <div className="auth-card">
        <h1>Set a new password</h1>
        <p className="auth-card-sub">Choose a strong password. All other sessions will be signed out.</p>
        <form onSubmit={submit} className="auth-form">
          <FormField label="New password" required hint="Minimum 10 characters with upper, lower, number and symbol.">
            <Input type="password" required value={pw} onChange={e => { setPw(e.target.value); setError('') }} />
          </FormField>
          {pw && (
            <div style={{ marginBottom: 12 }}>
              <span className={`badge badge-${s.tone}`}>{s.label}</span>
            </div>
          )}
          <FormField label="Confirm new password" required error={confirm && pw !== confirm ? 'Passwords do not match.' : undefined}>
            <Input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} />
          </FormField>
          {error && <div className="alert-banner danger" role="alert" style={{ marginBottom: 12 }}>{error}</div>}
          <Button type="submit" variant="primary" block>Update password</Button>
          <Link to="/login" className="u-sm" style={{ display: 'block', textAlign: 'center', marginTop: 12 }}>← Back to sign in</Link>
        </form>
      </div>
    </AuthLayout>
  )
}
