import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MailCheck, AlertTriangle } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Button } from '@/components/ui/Button'
import { FormField, Input } from '@/components/ui/FormControls'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    // Demo mode: in production POST /api/auth/forgot-password issues a
    // single-use, time-boxed reset token delivered to the verified email.
    setSent(true)
  }

  return (
    <AuthLayout>
      <div className="auth-card">
        {!sent ? (
          <>
            <h1>Reset your password</h1>
            <p className="auth-card-sub">Enter your institutional email. If it belongs to a registered account, a password-reset link will be sent.</p>
            <form onSubmit={submit} className="auth-form" noValidate>
              <FormField label="Institutional email" required htmlFor="fp-email">
                <Input id="fp-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@institution.edu.in" />
              </FormField>
              {error && (
                <div className="alert-banner danger" role="alert" style={{ marginBottom: 12 }}>
                  <AlertTriangle size={15} aria-hidden /> {error}
                </div>
              )}
              <Button type="submit" variant="primary" block>Send reset link</Button>
              <Link to="/login" className="u-sm" style={{ display: 'block', textAlign: 'center', marginTop: 12 }}>← Back to sign in</Link>
            </form>
          </>
        ) : (
          <>
            <h1 className="u-flex"><MailCheck size={22} color="var(--success)" aria-hidden /> Check your inbox</h1>
            <p className="auth-card-sub" style={{ marginTop: 8 }}>
              A reset link has been sent to <strong>{email}</strong>. The link expires in 30 minutes and can be used once.
            </p>
            <div className="alert-banner info">
              For your security, the request is logged with IP and device metadata. If you did not expect this email, contact your examination cell.
            </div>
            <Link to="/login"><Button variant="outline" block style={{ marginTop: 16 }}>Return to sign in</Button></Link>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
