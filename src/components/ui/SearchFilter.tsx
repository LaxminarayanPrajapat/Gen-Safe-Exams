import type { ReactNode } from 'react'
import { Search } from 'lucide-react'

export function SearchInput({
  value, onChange, placeholder = 'Search…', width = 240,
}: { value: string; onChange: (v: string) => void; placeholder?: string; width?: number }) {
  return (
    <div className="search-box" style={{ width }}>
      <Search aria-hidden />
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  )
}

interface FilterBarProps {
  children: ReactNode
}

/** Horizontal filter strip used above tables. */
export function FilterBar({ children }: FilterBarProps) {
  return <div className="filter-bar">{children}</div>
}
