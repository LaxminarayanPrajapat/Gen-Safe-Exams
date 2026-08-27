import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@/types'
import { users as demoUsers, DEMO_PASSWORD } from '@/data/demo'

/* ============================================================
   GEN SAFE EXAM — Auth context
   ------------------------------------------------------------
   DEMO MODE: authentication is simulated client-side against
   the bundled demo accounts. In production this context calls:
     POST /api/auth/login  →  httpOnly secure cookie session
   and the server enforces RBAC + tenant isolation.
   ============================================================ */

interface LoginResult {
  ok: boolean
  requiresMfa?: boolean
  mfaToken?: string
  error?: string
  lockedMinutes?: number
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  verifyMfa: (code: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const STORAGE_KEY = 'gse.session.user'
const MFA_TOKEN_KEY = 'gse.mfa.pending'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as User) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => () => sessionStorage.removeItem(MFA_TOKEN_KEY), [])

  const login = async (email: string, password: string): Promise<LoginResult> => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 550)) // simulated network latency
    try {
      const found = demoUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase())
      if (!found || password !== DEMO_PASSWORD) {
        // Demo of failed-login protection policy LOCK-5
        return { ok: false, error: 'Invalid email or password. After 5 failed attempts the account is temporarily locked.' }
      }
      if (found.status === 'LOCKED') {
        return { ok: false, error: 'Account locked after repeated failed attempts. Contact your administrator.', lockedMinutes: 15 }
      }
      if (found.status === 'SUSPENDED') {
        return { ok: false, error: 'This account has been suspended by your institution.' }
      }
      if (found.mfaEnabled) {
        const token = `mfa_${found.id}_${Date.now()}`
        sessionStorage.setItem(MFA_TOKEN_KEY, token)
        return { ok: true, requiresMfa: true, mfaToken: token }
      }
      completeSession(found)
      return { ok: true }
    } finally {
      setLoading(false)
    }
  }

  const verifyMfa = async (code: string): Promise<{ ok: boolean; error?: string }> => {
    await new Promise(r => setTimeout(r, 450))
    const pending = sessionStorage.getItem(MFA_TOKEN_KEY)
    if (!pending) return { ok: false, error: 'No MFA challenge in progress. Please sign in again.' }
    // Demo mode accepts the standard verification code shown in the UI hint.
    if (code.replace(/\s/g, '') !== '246810') {
      return { ok: false, error: 'Incorrect verification code. Check your authenticator app and try again.' }
    }
    const id = pending.split('_')[1]
    const found = demoUsers.find(u => u.id === id)
    if (!found) return { ok: false, error: 'Account not found.' }
    sessionStorage.removeItem(MFA_TOKEN_KEY)
    completeSession(found)
    return { ok: true }
  }

  const completeSession = (u: User) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    setUser(u)
  }

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyMfa, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
