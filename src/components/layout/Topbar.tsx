import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, LogOut, Settings as SettingsIcon, UserCircle2, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { roleLabel } from '@/data/nav'
import { initials } from '@/utils'
import { notifications } from '@/data/demo'

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (anchorRef.current && !anchorRef.current.contains(e.target as Node)) setMenuOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  if (!user) return null

  const unread = notifications.filter(n => !n.read).length
  const kindColor = (kind: string) =>
    kind === 'security' ? 'var(--danger)' : kind === 'approval' ? 'var(--warning)' : 'var(--blue)'

  return (
    <header className="topbar">
      <button className="icon-btn sidebar-toggle" onClick={onMenu} aria-label="Open navigation menu">
        <Menu />
      </button>

      <div className="topbar-search" role="search">
        <Search aria-hidden />
        <input type="search" placeholder="Search subjects, papers, staff…" aria-label="Global search"
          onKeyDown={e => {
            if (e.key === 'Enter') navigate('/question-papers')
          }} />
      </div>

      <div style={{ flex: 1 }} />

      {/* Environment indicator */}
      <span className="badge badge-outline" title="Demo dataset — no live AI or database calls">DEMO</span>

      <div className="popover-anchor" ref={notifRef}>
        <button className="icon-btn" onClick={() => { setNotifOpen(o => !o); setMenuOpen(false) }} aria-label={`Notifications (${unread} unread)`} aria-expanded={notifOpen}>
          <Bell />
          {unread > 0 && <span className="dot" />}
        </button>
        {notifOpen && (
          <div className="popover" role="menu" style={{ minWidth: 300 }}>
            <div className="popover-header u-bold u-sm u-uppercase" style={{ letterSpacing: '0.05em' }}>Notifications</div>
            {notifications.map(n => (
              <div key={n.id} className="notif-item">
                <ShieldAlert size={15} color={kindColor(n.kind)} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
                <div>
                  <div className="notif-title">{n.title}</div>
                  <div className="u-xs u-muted">{n.body}</div>
                  <div className="notif-time">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="popover-anchor" ref={anchorRef}>
        <button className="topbar-user" onClick={() => { setMenuOpen(o => !o); setNotifOpen(false) }} aria-haspopup="menu" aria-expanded={menuOpen}>
          <span className="topbar-user-meta">
            <span className="topbar-user-name">{user.name}</span><br />
            <span className="topbar-user-role">{roleLabel[user.role]}</span>
          </span>
          <span className="avatar">{initials(user.name)}</span>
        </button>
        {menuOpen && (
          <div className="popover" role="menu">
            <div className="popover-header">
              <div className="u-bold">{user.name}</div>
              <div className="u-xs u-muted">{user.email}</div>
            </div>
            <Link className="popover-item" role="menuitem" to="/profile" onClick={() => setMenuOpen(false)}>
              <UserCircle2 /> Profile & security
            </Link>
            <Link className="popover-item" role="menuitem" to="/settings" onClick={() => setMenuOpen(false)}>
              <SettingsIcon /> Settings
            </Link>
            <button className="popover-item danger" role="menuitem" onClick={() => { logout(); navigate('/login') }}>
              <LogOut /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
