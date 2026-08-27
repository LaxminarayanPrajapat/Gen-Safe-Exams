import { ShieldCheck, FileCheck2, Users, Lock } from 'lucide-react'
import type { ReactNode } from 'react'

/** Split brand pane + form pane used by login / forgot-password / reset. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell">
      <aside className="auth-brand-pane">
        <div className="auth-brand-top">
          <span className="sidebar-brand-mark" aria-hidden>GSE</span>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, letterSpacing: '0.03em' }}>GEN SAFE EXAM</div>
            <div className="sidebar-brand-sub">Secure Examination Management</div>
          </div>
        </div>

        <div className="auth-brand-body">
          <div className="auth-brand-tagline">AI-Assisted · Human-Verified · Secure by Design</div>
          <h1 className="auth-brand-h1">Examination integrity, engineered end to end.</h1>
          <p className="auth-brand-desc">
            GEN SAFE EXAM helps universities and colleges produce syllabus-aligned, balanced
            examination papers across multiple equivalent sets — with institutional hierarchy,
            multi-stage approval, an encrypted paper vault and complete audit traceability.
          </p>

          <div className="auth-principles">
            <span className="auth-principle"><ShieldCheck aria-hidden /> Rules engine constrains every generated paper against the approved blueprint.</span>
            <span className="auth-principle"><Users aria-hidden /> Four-eyes approval: staff → department head → college → university authority.</span>
            <span className="auth-principle"><FileCheck2 aria-hidden /> Every verification, edit, download and release is recorded as an immutable audit event.</span>
            <span className="auth-principle"><Lock aria-hidden /> Final papers are vaulted with AES-256 encryption and locked until scheduled release.</span>
          </div>
        </div>

        <div className="u-xs" style={{ color: 'rgba(199,211,222,0.55)' }}>
          © {new Date().getFullYear()} GEN SAFE EXAM Platform · Unauthorized access attempts are logged and monitored.
        </div>
      </aside>

      <div className="auth-form-pane">
        {children}
      </div>
    </div>
  )
}
