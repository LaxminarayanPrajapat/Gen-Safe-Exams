import type { CSSProperties, ReactNode } from 'react'

export function Card({ children, flush = false, className = '', style }: { children: ReactNode; flush?: boolean; className?: string; style?: CSSProperties }) {
  return <section className={`card ${flush ? 'card-flush' : ''} ${className}`.trim()} style={style}>{children}
  </section>
}

export function CardHeader({ title, sub, actions }: { title: ReactNode; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="card-header">
      <div>
        <h3>{title}</h3>
        {sub && <div className="card-sub">{sub}</div>}
      </div>
      {actions && <div className="u-flex" style={{ gap: 8 }}>{actions}</div>}
    </header>
  )
}

export function CardBody({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <div className={`card-body ${className}`.trim()} style={style}>{children}</div>
}
