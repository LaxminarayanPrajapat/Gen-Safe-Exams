import type { ReactNode } from 'react'

/* ---------- Distribution rows (difficulty / bloom / unit) ---------- */
const palette = ['var(--navy)', 'var(--blue)', 'var(--success)', 'var(--warning)', 'var(--danger)', '#6C7D8D']

export interface DistDatum { label: string; value: number }

export function DistributionBars({ data, colorClass = 'blue' }: { data: DistDatum[]; colorClass?: string }) {
  const max = Math.max(1, ...data.map(d => d.value))
  return (
    <div>
      {data.map((d, i) => (
        <div key={d.label} className="dist-row">
          <span className="u-truncate" title={d.label}>{d.label}</span>
          <div className="dist-track" role="img" aria-label={`${d.label}: ${Math.round(d.value)}%`}>
            <div
              className={`dist-fill ${colorClass}`}
              style={{ width: `${(d.value / max) * 100}%`, background: colorClass === 'auto' ? palette[i % palette.length] : undefined }}
            />
          </div>
          <span className="dist-val">{Math.round(d.value)}%</span>
        </div>
      ))}
    </div>
  )
}

export function ProgressBar({ value, max = 100, label }: { value: number; max?: number; label?: ReactNode }) {
  const width = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      {label && <div className="u-xs u-muted u-flex-between"><span>{label}</span><span>{label && typeof label === 'string' ? '' : ''}</span></div>}
      <div className="progress-bar" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <div className="progress-fill" style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}
