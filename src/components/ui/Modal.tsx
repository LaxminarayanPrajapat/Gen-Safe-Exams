import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, X, CheckCircle2 } from 'lucide-react'
import { Button } from './Button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  sub?: ReactNode
  wide?: boolean
  footer?: ReactNode
  children: ReactNode
}

export function Modal({ open, onClose, title, sub, wide = false, footer, children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}>
        <div className="modal-header">
          <div>
            <h3>{title}</h3>
            {sub && <div className="modal-sub">{sub}</div>}
          </div>
          <button className="icon-btn modal-close" onClick={onClose} aria-label="Close dialog"><X size={16} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

interface ConfirmProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: ReactNode
  confirmLabel?: string
  tone?: 'danger' | 'primary' | 'success'
}

/** Realistic confirmation dialog for sensitive/dangerous actions. */
export function ConfirmationDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', tone = 'danger' }: ConfirmProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <span className="u-flex">
          {tone === 'danger' && <AlertTriangle size={18} color="var(--danger)" aria-hidden />}
          {title}
        </span>
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant={tone === 'danger' ? 'danger' : tone === 'success' ? 'success' : 'primary'} onClick={() => { onConfirm(); onClose() }}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p style={{ fontSize: 'var(--fs-base)', lineHeight: 1.6 }}>{message}</p>
    </Modal>
  )
}

export function SuccessInline({ children }: { children: ReactNode }) {
  return (
    <span className="u-flex u-xs" style={{ color: 'var(--success)' }}>
      <CheckCircle2 size={14} aria-hidden /> {children}
    </span>
  )
}
