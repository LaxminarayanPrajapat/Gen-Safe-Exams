import { Link } from 'react-router-dom'
import { ShieldX } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { roleLabel } from '@/data/nav'

export default function ForbiddenPage() {
  const { user, logout } = useAuth()
  return (
    <div className="center-page">
      <div>
        <ShieldX size={40} color="var(--danger)" style={{ margin: '0 auto 14px' }} aria-hidden />
        <h1>Access restricted</h1>
        <p className="u-muted" style={{ marginTop: 8, maxWidth: 420 }}>
          Your role{user ? ` (${roleLabel[user.role]})` : ''} is not authorized to open this module.
          This attempt has been recorded in the audit log. If you believe this is an error,
          contact your institution's administrator.
        </p>
        <div className="u-flex" style={{ justifyContent: 'center', marginTop: 18 }}>
          <Link to="/dashboard" className="btn btn-primary">Return to dashboard</Link>
          <button className="btn btn-outline" onClick={logout}>Sign out</button>
        </div>
      </div>
    </div>
  )
}
