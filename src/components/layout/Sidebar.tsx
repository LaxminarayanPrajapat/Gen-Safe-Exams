import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Network, Landmark, Building2, GitBranch, Users,
  BookOpen, FileText, Database, Sparkles, FileStack, CheckCircle2,
  Lock, CalendarClock, ShieldCheck, ScrollText, Settings, UserCircle2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { navGroups } from '@/data/nav'
import { useAuth } from '@/context/AuthContext'

const icons: Record<string, LucideIcon> = {
  LayoutDashboard, Network, Landmark, Building2, GitBranch, Users,
  BookOpen, FileText, Database, Sparkles, FileStack, CheckCircle2,
  Lock, CalendarClock, ShieldCheck, ScrollText, Settings, UserCircle2,
}

const badgeCounts = { approvals: 2, security: 1 } as const

export function Sidebar({ open, onNavigate }: { open: boolean; onNavigate?: () => void }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return null

  return (
    <nav className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Primary navigation">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark" aria-hidden>GSE</span>
        <div>
          <div className="sidebar-brand-name">GEN SAFE EXAM</div>
          <div className="sidebar-brand-sub">Examination Control</div>
        </div>
      </div>

      <div className="sidebar-nav">
        {navGroups.map(group => {
          const items = group.items.filter(i => i.roles.includes(user.role))
          if (items.length === 0) return null
          return (
            <div key={group.label}>
              <div className="sidebar-group-label">{group.label}</div>
              {items.map(item => {
                const Icon = icons[item.icon] ?? LayoutDashboard
                const active =
                  location.pathname === item.to ||
                  (item.to !== '/dashboard' && location.pathname.startsWith(item.to))
                const count = item.badgeKey ? badgeCounts[item.badgeKey as keyof typeof badgeCounts] : undefined
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={`sidebar-link ${active ? 'is-active' : ''}`}
                  >
                    <Icon aria-hidden />
                    {item.label}
                    {count ? <span className="sidebar-badge" aria-label={`${count} pending`}>{count}</span> : null}
                  </NavLink>
                )
              })}
            </div>
          )
        })}
      </div>

      <div className="sidebar-foot">
        <span className="env-tag">DEMO MODE</span><br />
        Local dataset · no live AI calls.<br />
        v1.0.0 · build {new Date().getFullYear()}
      </div>
    </nav>
  )
}
