import { ShieldCheck, Lock } from 'lucide-react'
import type { ReactNode } from 'react'

type BadgeTone = 'gray' | 'navy' | 'blue' | 'green' | 'amber' | 'red' | 'outline'

const toneClass: Record<BadgeTone, string> = {
  gray: 'badge-gray', navy: 'badge-navy', blue: 'badge-blue',
  green: 'badge-green', amber: 'badge-amber', red: 'badge-red', outline: 'badge-outline',
}

export function StatusBadge({ tone = 'gray', dot = true, children }: { tone?: BadgeTone; dot?: boolean; children: ReactNode }) {
  return (
    <span className={`badge ${toneClass[tone]}`}>
      {dot && <span className="badge-dot" aria-hidden />}
      {children}
    </span>
  )
}

/* Central semantic → tone mapping used across the app */
export const statusTone = (status: string): BadgeTone => {
  switch (status) {
    case 'ACTIVE': case 'VERIFIED': case 'APPROVED': case 'RELEASED': case 'DELIVERED':
    case 'SUCCESS': case 'RESOLVED': return 'green'
    case 'PENDING': case 'PENDING_APPROVAL': case 'UNDER_REVIEW': case 'SUBMITTED': case 'SCHEDULED':
    case 'AI_EXTRACTED': case 'DRAFT': case 'IN_REVIEW': case 'PENDING_REVIEW': case 'WARNING': return 'amber'
    case 'REJECTED': case 'SUSPENDED': case 'REVOKED': case 'FAILURE': case 'DENIED': case 'LOCKED':
    case 'EXPIRED': case 'CRITICAL': return 'red'
    case 'IN_VAULT': case 'ARCHIVED': case 'CHANGES_REQUESTED': case 'MEDIUM': case 'HIGH': return 'blue'
    default: return 'gray'
  }
}

export function SecurityBadge({ label, locked = false }: { label: string; locked?: boolean }) {
  const Icon = locked ? Lock : ShieldCheck
  return (
    <span className={`security-badge ${locked ? 'locked' : ''}`}>
      <Icon aria-hidden />
      {label}
    </span>
  )
}
