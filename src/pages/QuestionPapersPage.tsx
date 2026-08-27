import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Eye, Lock, ShieldCheck } from 'lucide-react'
import { StatusBadge, statusTone, DataTable, FilterBar, SearchInput } from '@/components/ui'
import type { Column } from '@/components/ui/DataTable'
import { Pagination, usePagedRows } from '@/components/ui/DataTable'
import { Select } from '@/components/ui/FormControls'
import { useAuth } from '@/context/AuthContext'
import { papers as seed, subjects } from '@/data/demo'
import type { QuestionPaper } from '@/types'
import { formatDate } from '@/utils'
import { SecurityBadge } from '@/components/ui/Badge'

export default function QuestionPapersPage() {
  const { user } = useAuth()
  const [rows] = useState<QuestionPaper[]>(seed)
  const [search, setSearch] = useState('')
  const [statusF, setStatusF] = useState('')
  const [subjectF, setSubjectF] = useState('')

  const filtered = rows.filter(p =>
    (!search || p.title.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())) &&
    (!statusF || p.status === statusF) &&
    (!subjectF || p.subjectCode === subjectF),
  )
  const { page, setPage, paged, total } = usePagedRows(filtered, 8)

  const canCreate = ['DEPARTMENT_STAFF', 'DEPARTMENT_HEAD', 'SUPER_ADMIN'].includes(user?.role ?? '')

  const columns: Column<QuestionPaper>[] = [
    {
      key: 'paper', header: 'Paper',
      render: p => (
        <Link to={`/question-papers/${p.id}`} className="cell-main">{p.code}
          <div className="cell-sub" style={{ maxWidth: 300 }}>{p.title}</div>
        </Link>
      ),
    },
    { key: 'subject', header: 'Subject', render: p => <span className="u-mono u-xs">{p.subjectCode}</span> },
    { key: 'sets', header: 'Sets', render: p => p.sets.map(s => s.label).join(' · ') },
    { key: 'marks', header: 'Marks', render: p => String(p.totalMarks), align: 'center' },
    { key: 'valid', header: 'Validation', render: p => <span className="u-bold">{p.qualitySummary.validationScore}</span>, align: 'right' },
    { key: 'exam', header: 'Exam date', render: p => formatDate(p.examDate) },
    {
      key: 'status', header: 'Status',
      render: p => (
        <span className="u-flex">
          <StatusBadge tone={statusTone(p.status)}>{p.status.replaceAll('_', ' ')}</StatusBadge>
          {(p.status === 'IN_VAULT' || p.vault) && <Lock size={12} color="var(--warning)" aria-label="Vaulted" />}
        </span>
      ),
    },
    { key: 'updated', header: 'Updated', render: p => formatDate(p.updatedAt) },
    {
      key: 'actions', header: '', align: 'right',
      render: p => <div className="row-actions"><Link to={`/question-papers/${p.id}`} className="icon-btn" title="Open paper" aria-label={`Open ${p.code}`}><Eye size={15} /></Link></div>,
    },
  ]

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Question papers</h1>
          <p className="page-desc">
            Multi-set papers generated against approved blueprints, moving through a fixed approval chain to the secure vault.
          </p>
        </div>
        {canCreate && (
          <Link to="/question-papers/create" className="btn btn-primary"><Plus size={14} /> New paper</Link>
        )}
      </div>

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search paper code or title…" width={280} />
        <Select value={subjectF} onChange={e => setSubjectF(e.target.value)} aria-label="Subject"
          options={[{ value: '', label: 'All subjects' }, ...subjects.map(s => ({ value: s.code, label: s.code }))]} />
        <Select value={statusF} onChange={e => setStatusF(e.target.value)} aria-label="Status"
          options={[{ value: '', label: 'All statuses' }, 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'IN_VAULT', 'RELEASED', 'ARCHIVED']} />
        <div className="spacer" />
        <SecurityBadge label="Vault sealed until release time" locked />
      </FilterBar>

      <DataTable columns={columns} rows={paged} rowKey={p => p.id} />
      <div className="table-footer" style={{ marginTop: 10 }}>
        <Pagination page={page} pageSize={8} total={total} onPage={setPage} />
      </div>

      <div className="u-xs u-muted u-flex" style={{ marginTop: 14 }}>
        <ShieldCheck size={13} aria-hidden /> No staff role can finalize or release a paper. Final release requires the University Exam Controller through the scheduled release module.
      </div>
    </>
  )
}
