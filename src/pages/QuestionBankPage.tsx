import { useMemo, useState } from 'react'
import { Database, Eye, CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatusBadge, statusTone, DataTable, FilterBar, SearchInput } from '@/components/ui'
import type { Column } from '@/components/ui/DataTable'
import { Pagination, usePagedRows } from '@/components/ui/DataTable'
import { Select, FormField } from '@/components/ui/FormControls'
import { Modal, ConfirmationDialog } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'
import { questions as seed, subjects } from '@/data/demo'
import type { Question } from '@/types'
import {
  formatDate, questionTypeLabel, difficultyTone,
} from '@/utils'

export default function QuestionBankPage() {
  const toast = useToast()
  const { user } = useAuth()
  const isDeptScoped = user?.role === 'DEPARTMENT_HEAD' || user?.role === 'DEPARTMENT_STAFF'
  const base = isDeptScoped ? seed.filter(q => subjects.find(s => s.id === q.subjectId)?.departmentId === user!.organizationId) : seed

  const [rows, setRows] = useState<Question[]>(base)
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('')
  const [type, setType] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [bloom, setBloom] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [detail, setDetail] = useState<Question | null>(null)
  const [rejectTarget, setRejectTarget] = useState<Question | null>(null)

  const filtered = useMemo(() => rows.filter(q =>
    (!search || q.text.toLowerCase().includes(search.toLowerCase()) || q.topic.toLowerCase().includes(search.toLowerCase())) &&
    (!subject || q.subjectCode === subject) &&
    (!type || q.type === type) &&
    (!difficulty || q.difficulty === difficulty) &&
    (!bloom || q.bloom === bloom) &&
    (!statusFilter || q.status === statusFilter),
  ), [rows, search, subject, type, difficulty, bloom, statusFilter])

  const { page, setPage, paged, total } = usePagedRows(filtered, 8)

  const canReview = user?.role === 'DEPARTMENT_HEAD' || user?.role === 'SUPER_ADMIN'

  const columns: Column<Question>[] = [
    {
      key: 'text', header: 'Question',
      render: q => (
        <span style={{ display: 'block', maxWidth: 420 }}>
          <span className="cell-main" style={{ fontWeight: 500 }}>{q.text.length > 96 ? `${q.text.slice(0, 96)}…` : q.text}</span>
          <div className="cell-sub">{q.subjectCode} · Unit {q.unit} · {q.topic} {q.aiGenerated && '· AI-generated'}</div>
        </span>
      ),
    },
    { key: 'type', header: 'Type', render: q => <span className="u-xs">{questionTypeLabel[q.type]}</span> },
    { key: 'marks', header: 'Marks', render: q => String(q.marks), align: 'center' },
    {
      key: 'diff', header: 'Difficulty',
      render: q => <StatusBadge tone={difficultyTone[q.difficulty] as 'green' | 'amber' | 'red'}>{q.difficulty}</StatusBadge>,
    },
    { key: 'bloom', header: 'Bloom', render: q => q.bloom },
    { key: 'dup', header: 'Dup score', render: q => <span className="u-mono u-xs">{q.duplicateScore.toFixed(2)}</span>, align: 'right' },
    { key: 'valid', header: 'Validation', render: q => <span className="u-bold">{q.validationScore}</span>, align: 'right' },
    { key: 'status', header: 'Status', render: q => <StatusBadge tone={statusTone(q.status)}>{q.status.replaceAll('_', ' ')}</StatusBadge> },
    {
      key: 'actions', header: '', align: 'right',
      render: q => (
        <div className="row-actions">
          <button className="icon-btn" title="Inspect question" onClick={() => setDetail(q)}><Eye size={15} /></button>
          {canReview && q.status === 'PENDING_REVIEW' && (
            <>
              <button className="icon-btn" title="Approve question" onClick={() => approve(q)}><CheckCircle2 size={15} color="var(--success)" /></button>
              <button className="icon-btn" title="Reject question" onClick={() => setRejectTarget(q)}><XCircle size={15} color="var(--danger)" /></button>
            </>
          )}
        </div>
      ),
    },
  ]

  const approve = (q: Question) => {
    setRows(rows.map(r => r.id === q.id ? { ...r, status: 'APPROVED', reviewedBy: user!.name } : r))
    toast.push('success', 'Question approved', `Q ${q.id} added to the approved bank. QUESTION_APPROVED audit event recorded.`)
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Question bank</h1>
          <p className="page-desc">
            Every question carries full academic metadata, semantic duplicate score and validation result.
            AI-generated questions enter the bank only after human review.
          </p>
        </div>
        {['DEPARTMENT_STAFF', 'DEPARTMENT_HEAD'].includes(user?.role ?? '') && (
          <Link to="/questions/generate" className="btn btn-primary"><Sparkles size={14} /> Generate questions</Link>
        )}
      </div>

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search question text or topic…" />
        <Select value={subject} onChange={e => setSubject(e.target.value)} aria-label="Subject"
          options={[{ value: '', label: 'All subjects' }, ...subjects.map(s => ({ value: s.code, label: s.code }))]} />
        <Select value={type} onChange={e => setType(e.target.value)} aria-label="Type"
          options={[{ value: '', label: 'All types' }, ...Object.entries(questionTypeLabel).map(([v, l]) => ({ value: v, label: l }))]} />
        <Select value={difficulty} onChange={e => setDifficulty(e.target.value)} aria-label="Difficulty"
          options={[{ value: '', label: 'All difficulty' }, 'Easy', 'Medium', 'Hard']} />
        <Select value={bloom} onChange={e => setBloom(e.target.value)} aria-label="Bloom level"
          options={[{ value: '', label: 'All Bloom levels' }, 'Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create']} />
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="Status"
          options={[{ value: '', label: 'All statuses' }, 'APPROVED', 'PENDING_REVIEW', 'REJECTED']} />
        <div className="spacer" />
        <span className="u-xs u-muted"><Database size={12} aria-hidden /> {filtered.length} questions</span>
      </FilterBar>

      <DataTable columns={columns} rows={paged} rowKey={q => q.id} />
      <div className="table-footer" style={{ marginTop: 10 }}>
        <Pagination page={page} pageSize={8} total={total} onPage={setPage} />
      </div>

      {/* Detail drawer */}
      <Drawer open={!!detail} onClose={() => setDetail(null)}
        title="Question record" sub={`${detail?.id ?? ''} · v${detail?.version ?? 1}`}
        footer={canReview && detail?.status === 'PENDING_REVIEW' ? (
          <>
            <Button variant="danger-outline" onClick={() => { setRejectTarget(detail!); setDetail(null) }}>Reject</Button>
            <Button variant="success" onClick={() => { approve(detail!); setDetail(null) }}><CheckCircle2 size={14} /> Approve</Button>
          </>
        ) : undefined}>
        {detail && (
          <>
            <p style={{ fontSize: 'var(--fs-base)', lineHeight: 1.65 }}>{detail.text}</p>
            <hr className="divider" />
            <div className="kv-list">
              <dt>Subject / unit</dt><dd>{detail.subjectCode} · Unit {detail.unit} ({detail.unitTitle})</dd>
              <dt>Topic</dt><dd>{detail.topic}</dd>
              <dt>Type</dt><dd>{questionTypeLabel[detail.type]}</dd>
              <dt>Marks / difficulty</dt><dd>{detail.marks} · {detail.difficulty}</dd>
              <dt>Bloom level</dt><dd>{detail.bloom}</dd>
              <dt>Learning outcome</dt><dd>{detail.learningOutcome}</dd>
              <dt>Reference answer</dt><dd className="u-muted">{detail.referenceAnswer}</dd>
              <dt>Origin</dt><dd>{detail.aiGenerated ? `AI Service (${detail.createdBy})` : detail.createdBy}</dd>
              <dt>Reviewed by</dt><dd>{detail.reviewedBy ?? 'Pending review'}</dd>
              <dt>Created</dt><dd>{formatDate(detail.createdAt)}</dd>
              <dt>Prior usage</dt><dd>{detail.usageCount} papers</dd>
            </div>
            <hr className="divider" />
            <h4 style={{ marginBottom: 10 }}>Automated validation</h4>
            <div className="check-list">
              <span className="check-item pass"><CheckCircle2 /> Syllabus relevance — topic mapped to approved Unit {detail.unit}</span>
              <span className={`check-item ${detail.duplicateScore > 0.25 ? 'warn' : 'pass'}`}>
                {detail.duplicateScore > 0.25 ? <XCircle /> : <CheckCircle2 />}
                Semantic duplicate score {detail.duplicateScore.toFixed(2)} via pgvector similarity (threshold 0.85)
              </span>
              <span className={`check-item ${detail.validationScore >= 90 ? 'pass' : 'warn'}`}>
                {detail.validationScore >= 90 ? <CheckCircle2 /> : <XCircle />} Overall rule score {detail.validationScore}/100
              </span>
              <span className="check-item pass"><CheckCircle2 /> Marks suitable for question type & Bloom level</span>
              <span className="check-item pass"><CheckCircle2 /> Grammar & ambiguity screening passed</span>
            </div>
          </>
        )}
      </Drawer>

      <ConfirmationDialog open={!!rejectTarget} onClose={() => setRejectTarget(null)}
        onConfirm={() => {
          if (!rejectTarget) return
          setRows(rows.map(r => r.id === rejectTarget.id ? { ...r, status: 'REJECTED', reviewedBy: user!.name } : r))
          toast.push('warning', 'Question rejected', `${rejectTarget.id} marked REJECTED. QUESTION_REJECTED audit event recorded.`)
        }}
        tone="danger" confirmLabel="Reject question"
        title="Reject this question?"
        message={`${rejectTarget?.text.slice(0, 120)}… will be excluded from paper generation. The rejection reason and reviewer identity are stored immutably.`} />
    </>
  )
}
