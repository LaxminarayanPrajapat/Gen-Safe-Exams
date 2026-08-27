import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'

/* ============================================================
   DataTable — generic, responsive (horizontal scroll wrapper)
   ============================================================ */
export interface Column<T> {
  key: string
  header: ReactNode
  render: (row: T) => ReactNode
  width?: string
  align?: 'left' | 'right' | 'center'
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  emptyState?: ReactNode
  footer?: ReactNode
  onRowClick?: (row: T) => void
}

export function DataTable<T>({ columns, rows, rowKey, emptyState, footer, onRowClick }: DataTableProps<T>) {
  if (rows.length === 0 && emptyState) return <>{emptyState}</>
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c.key} style={{ width: c.width, textAlign: c.align ?? 'left' }}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={{ cursor: onRowClick ? 'pointer' : undefined }}
            >
              {columns.map(c => (
                <td key={c.key} style={{ textAlign: c.align ?? 'left' }}>{c.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer && <tfoot>{footer}</tfoot>}
      </table>
    </div>
  )
}

/* ---------- Pagination ---------- */
export function Pagination({
  page, pageSize, total, onPage,
}: { page: number; pageSize: number; total: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const window = useMemo(() => {
    const out: number[] = []
    for (let p = Math.max(1, page - 2); p <= Math.min(pages, page + 2); p++) out.push(p)
    return out
  }, [page, pages])

  if (total === 0) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)

  return (
    <>
      <span>Showing {from}–{to} of {total}</span>
      <div className="pagination">
        <button className="page-btn" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">‹</button>
        {window[0] > 1 && <button className="page-btn" onClick={() => onPage(1)}>1</button>}
        {window[0] > 2 && <span className="u-xs u-muted">…</span>}
        {window.map(p => (
          <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => onPage(p)} aria-current={p === page ? 'page' : undefined}>{p}</button>
        ))}
        {window[window.length - 1] < pages - 1 && <span className="u-xs u-muted">…</span>}
        {window[window.length - 1] < pages && <button className="page-btn" onClick={() => onPage(pages)}>{pages}</button>}
        <button className="page-btn" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page">›</button>
      </div>
    </>
  )
}

/** Client-side paging hook used by list pages. */
export function usePagedRows<T>(rows: T[], pageSize = 10) {
  const [page, setPage] = useState(1)
  const start = (page - 1) * pageSize
  const paged = rows.slice(start, start + pageSize)
  return { page, setPage, paged, total: rows.length }
}
