import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  value: string | number
  label: string
  hint?: string
  tone?: 'navy' | 'green' | 'amber' | 'red'
}

const toneClass = { navy: '', green: 'tone-green', amber: 'tone-amber', red: 'tone-red' } as const

export function StatCard({ icon: Icon, value, label, hint, tone = 'navy' }: StatCardProps) {
  return (
    <div className="stat-card">
      <span className={`stat-icon ${toneClass[tone]}`} aria-hidden>
        <Icon />
      </span>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {hint && <div className="stat-hint">{hint}</div>}
      </div>
    </div>
  )
}
