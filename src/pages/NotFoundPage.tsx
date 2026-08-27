import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="center-page">
      <div>
        <div className="stat-value" style={{ fontSize: 44 }}>404</div>
        <h1>Page not found</h1>
        <p className="u-muted" style={{ marginTop: 8 }}>The page you requested does not exist or has been moved.</p>
        <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 16 }}>Go to dashboard</Link>
      </div>
    </div>
  )
}
