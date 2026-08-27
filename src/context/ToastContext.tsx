import { createContext, useCallback, useContext, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react'

type ToastKind = 'info' | 'success' | 'warning' | 'error'

interface ToastItem { id: number; kind: ToastKind; title: string; message?: string }
interface ToastContextValue { push: (kind: ToastKind, title: string, message?: string) => void }

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 1

const icons = {
  info: Info, success: CheckCircle2, warning: AlertTriangle, error: XCircle,
} as const

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef<number[]>([])

  const push = useCallback((kind: ToastKind, title: string, message?: string) => {
    const id = nextId++
    setToasts(t => [...t.slice(-3), { id, kind, title, message }])
    const timer = window.setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id))
    }, 4200)
    timers.current.push(timer)
  }, [])

  const dismiss = (id: number) => setToasts(t => t.filter(x => x.id !== id))

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map(t => {
          const Icon = icons[t.kind]
          return (
            <div key={t.id} className={`toast ${t.kind}`}>
              <Icon aria-hidden />
              <div>
                <div className="toast-title">{t.title}</div>
                {t.message && <div className="toast-msg">{t.message}</div>}
              </div>
              <button className="toast-close" aria-label="Dismiss notification" onClick={() => dismiss(t.id)}>
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
