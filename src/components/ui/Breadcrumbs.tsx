import { Fragment } from 'react'
import { Link, useLocation, matchPath } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

interface Crumb { label: string; to?: string }

/** Breadcrumb trail derived from the current route + optional overrides. */
export function Breadcrumbs(overrides: Crumb[] = []) {
  return function BreadcrumbsComponent() {
    const location = useLocation()
    const segments = location.pathname.split('/').filter(Boolean)

    const autoCrumbs: Crumb[] = [{ label: 'Home', to: '/dashboard' }]
    let path = ''
    for (const seg of segments.slice(0, -1)) {
      path += `/${seg}`
      autoCrumbs.push({ label: humanize(seg), to: path })
    }
    const last = segments[segments.length - 1]
    const isId = /^[a-z0-9-]{6,}$/.test(last ?? '') && !isNaN(Date.parse(last ?? '')) === false && last?.length > 20
    if (last && !isId) autoCrumbs.push({ label: humanize(last) })

    const crumbs = overrides.length ? [...overrides] : autoCrumbs

    return (
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Home size={12} aria-hidden style={{ opacity: 0.7 }} />
        {crumbs.map((c, i) => (
          <Fragment key={`${c.label}-${i}`}>
            <ChevronRight className="sep" size={11} aria-hidden />
            {c.to && i < crumbs.length - 1
              ? <Link to={c.to}>{c.label}</Link>
              : <span className="current">{c.label}</span>}
          </Fragment>
        ))}
      </nav>
    )
  }
}

function humanize(seg: string): string {
  if (/^\d+$/.test(seg)) return `#${seg}`
  return seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

/** Helper used by pages that need a static breadcrumb override. */
export function useCurrentPathMatches(pattern: string): boolean {
  const location = useLocation()
  return Boolean(matchPath(pattern, location.pathname))
}
