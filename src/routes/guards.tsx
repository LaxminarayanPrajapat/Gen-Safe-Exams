import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'
import type { Role } from '@/types'

/** Blocks unauthenticated users and enforces per-route role allow-lists. */
export function RequireAuth({ roles, children }: { roles?: Role[]; children?: ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />
  }
  return <>{children ?? <Outlet />}</>
}

export function RequireRole({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user || !roles.includes(user.role)) return null
  return <>{children}</>
}
