import { useState } from 'react'
import type { ReactNode } from 'react'

interface TabsProps {
  tabs: { id: string; label: string; count?: number }[]
  active: string
  onChange: (id: string) => void
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map(t => (
        <button
          key={t.id}
          role="tab"
          aria-selected={t.id === active}
          className={`tab ${t.id === active ? 'active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
          {t.count !== undefined && <span className="count">{t.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function TabPanel({ children }: { children: ReactNode }) {
  return <div role="tabpanel">{children}</div>
}

/** Small helper for pages that own tab state. */
export function useTabs(defaultId: string, ids: string[]) {
  const [active, setActive] = useState(defaultId)
  return { active: ids.includes(active) ? active : defaultId, setActive }
}
