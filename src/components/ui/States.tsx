import type { LucideIcon } from 'lucide-react'
import { Inbox, Loader2, AlertOctagon } from 'lucide-react'
import type { ReactNode } from 'react'

export function EmptyState({ icon: Icon = Inbox, title, description, action }: {
  icon?: LucideIcon; title: string; description?: string; action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon" aria-hidden><Icon /></span>
      <h4>{title}</h4>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="loading-block" role="status">
      <Loader2 className="spinner" aria-hidden />
      {label}
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', description, onRetry }: {
  title?: string; description?: string; onRetry?: () => void
}) {
  return (
    <EmptyState
      icon={AlertOctagon}
      title={title}
      description={description ?? 'An unexpected error occurred. If the problem persists, contact the platform administrator.'}
      action={onRetry ? undefined : undefined}
    />
  )
}
