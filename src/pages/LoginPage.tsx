import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Lock, ShieldCheck, AlertTriangle } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { FormField, Input } from '@/components/ui/FormControls'
import { DEMO_PASSWORD, users as demoUsers } from '@/data/demo'

export default function LoginPage() {
  const { login, verifyMfa, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string } }

  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [mfaUserEmail, setMfaUserEmail] = useState('')

  const submitCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await login(email, password)
    if (!res.ok) { setError(res.error ?? 'Sign-in failed.'); return }
    if (res.requiresMfa) {
      setMfaUserEmail(email)
      setStep('mfa')
      return
    }
    redirectAfterLogin(email)
  }

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await verifyMfa(otp.join(''))
    if (!res.ok) { setError(res.error ?? 'Verification failed.'); return }
    redirectAfterLogin(mfaUserEmail)
  }

  const redirectAfterLogin = (userEmail: string) => {
    // Role-aware redirection
    navigate(location.state?.from && location.state.from !== '/login' ? location.state.from : '/dashboard', { replace: true })
    void userEmail
  }

  const setDigit = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[idx] = digit
    setOtp(next)
    if (digit && idx < 5) {
      const el = document.getElementById(`otp-${idx + 1}`)
      ;(el as HTMLInputElement | null)?.focus()
    }
  }

  return (
    <AuthLayout>
      <div className="auth-card">
        {step === 'credentials' ? (
          <>
            <h1>Sign in</h1>
            <p className="auth-card-sub">Use your institutional account. Access is restricted to verified personnel.</p>
            <form onSubmit={submitCredentials} className="auth-form" noValidate>
              <FormField label="Institutional email" required htmlFor="email">
                <Input id="email" type="email" autoComplete="username" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="name@institution.edu.in" />
              </FormField>
              <FormField label="Password" required htmlFor="password">
                <Input id="password" type="password" autoComplete="current-password" required
                  value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••" />
              </FormField>
              {error && (
                <div className="alert-banner danger" role="alert" style={{ marginBottom: 12 }}>
                  <AlertTriangle size={15} aria-hidden /> {error}
                </div>
              )}
              <div className="u-flex-between" style={{ marginBottom: 10 }}>
                <Link to="/forgot-password" className="u-sm">Forgot password?</Link>
                <span className="u-xs u-muted u-flex"><Lock size={11} /> TLS 1.3 · session-bound</span>
              </div>
              <Button type="submit" variant="primary" block disabled={loading}>
                {loading ? 'Verifying…' : 'Sign in securely'}
              </Button>
            </form>

            <div className="auth-demo">
              <div className="auth-demo-title">Demo accounts — password: {DEMO_PASSWORD}</div>
              {demoUsers.slice(0, 8).map(u => (
                <button key={u.id} className="auth-demo-row"
                  onClick={() => { setEmail(u.email); setPassword(DEMO_PASSWORD); setError('') }}>
                  <span>{u.email}</span>
                  <span className="role">{u.role.replaceAll('_', ' ')}</span>
                </button>
              ))}
              <div className="u-xs u-muted" style={{ marginTop: 6 }}>
                MFA-enabled accounts will prompt for a verification code (demo code: <strong>246810</strong>).
              </div>
            </div>
          </>
        ) : (
          <>
            <span className="badge badge-navy" style={{ marginBottom: 10 }}><ShieldCheck size={12} aria-hidden /> Two-factor authentication</span>
            <h1>Verify it's you</h1>
            <p className="auth-card-sub">Enter the 6-digit code from your authenticator app for <strong>{mfaUserEmail}</strong>.</p>
            <form onSubmit={submitOtp} className="auth-form">
              <FormField label="Verification code" required>
                <div className="otp-inputs">
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={d}
                      onChange={e => setDigit(i, e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Backspace' && !otp[i] && i > 0) {
                          (document.getElementById(`otp-${i - 1}`) as HTMLInputElement)?.focus()
                        }
                      }}
                      aria-label={`Digit ${i + 1}`}
                    />
                  ))}
                </div>
              </FormField>
              {error && (
                <div className="alert-banner danger" role="alert" style={{ marginBottom: 12 }}>
                  <AlertTriangle size={15} aria-hidden /> {error}
                </div>
              )}
              <p className="mfa-hint">Demo mode: any MFA-enabled account accepts code <strong>246810</strong>. In production this is a TOTP/OTP challenge issued by the backend.</p>
              <Button type="submit" variant="primary" block>Complete sign-in</Button>
              <Button type="button" variant="ghost" block onClick={() => { setStep('credentials'); setError(''); setOtp(['','','','','','']) }}>
                Back to sign in
              </Button>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
