import { useState } from 'react'
import { FileText, CheckCircle2, Loader2, CircleDashed, ShieldCheck } from 'lucide-react'
import { Card, CardHeader, CardBody, StatusBadge, statusTone, Button, Tabs, FormField, Textarea, Select, FileUploader } from '@/components/ui'
import { useToast } from '@/context/ToastContext'
import { subjects, syllabi } from '@/data/demo'
import { useAuth } from '@/context/AuthContext'
import type { SyllabusUnit } from '@/types'
import { sleep } from '@/utils'

const PIPELINE_STEPS = [
  'Document processing', 'Text extraction', 'Chunking', 'Embeddings',
  'Vector store (pgvector)', 'Retrieval + LLM', 'Structured validation',
]

export default function SyllabusPage() {
  const toast = useToast()
  const { user } = useAuth()
  const canUpload = ['DEPARTMENT_HEAD', 'DEPARTMENT_STAFF'].includes(user?.role ?? '')

  const [tab, setActive] = useState('library')
  const [subjectId, setSubjectId] = useState(subjects[0].id)
  const [mode, setMode] = useState<'file' | 'text'>('file')
  const [pastedText, setPastedText] = useState('')
  const [fileName, setFileName] = useState('')
  const [running, setRunning] = useState(false)
  const [stepIndex, setStepIndex] = useState(-1)
  const [extracted, setExtracted] = useState<SyllabusUnit[] | null>(null)

  const runExtraction = async () => {
    if (!fileName && !pastedText) {
      toast.push('warning', 'Nothing to analyze', 'Upload a document or paste syllabus text first.')
      return
    }
    setRunning(true)
    setExtracted(null)
    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      setStepIndex(i)
      await sleep(420)
    }
    // DEMO MODE: deterministic extraction result. Production calls
    // POST /api/syllabus/analyze which returns validated structured JSON.
    setExtracted(DEMO_EXTRACTION)
    setRunning(false)
    setStepIndex(PIPELINE_STEPS.length)
    toast.push('success', 'Extraction complete', 'Review the extracted structure carefully — AI output is never auto-approved.')
  }

  const approveStructure = () => {
    toast.push('success', 'Syllabus submitted for approval',
      'Verified structure stored as draft v+1 and routed to the Department Head. SYLLABUS_UPLOADED audit event recorded.')
    setExtracted(null); setFileName(''); setPastedText(''); setStepIndex(-1); setActive('library')
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Syllabus management</h1>
          <p className="page-desc">
            AI reads only approved institutional material. Extracted structure is shown to staff for verification
            before it can be used as generation context.
          </p>
        </div>
        {canUpload && (
          <Button variant="primary" onClick={() => { setActive('upload'); window.scrollTo({ top: 0 }) }}>New extraction</Button>
        )}
      </div>

      <Tabs
        active={tab} onChange={setActive}
        tabs={[
          { id: 'library', label: 'Approved syllabi', count: syllabi.filter(s => s.status === 'APPROVED').length },
          { id: 'upload', label: 'Upload & AI analysis' },
        ]}
      />

      {tab === 'library' ? (
        <Card flush>
          <CardHeader title="Subject syllabi" sub="Only APPROVED structures feed question generation" />
          <table className="data-table">
            <thead><tr><th>Subject</th><th>Version</th><th>Units</th><th>Source</th><th>Status</th></tr></thead>
            <tbody>
              {syllabi.map(s => {
                const subj = subjects.find(x => x.id === s.subjectId)!
                return (
                  <tr key={s.id}>
                    <td className="cell-main">{subj.code} — {subj.name}</td>
                    <td>v{s.version}</td>
                    <td>{s.units.length}</td>
                    <td className="u-xs u-muted u-flex"><FileText size={12} aria-hidden /> {s.sourceFile ?? 'Structured entry'}</td>
                    <td><StatusBadge tone={statusTone(s.status)}>{s.status.replaceAll('_', ' ')}</StatusBadge></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      ) : (
        <div className="dash-grid">
          <Card>
            <CardHeader title="Upload syllabus document" sub="PDF / DOCX / TXT — processed server-side by the institutional AI service; documents never leave your tenant unencrypted." />
            <CardBody>
              <FormField label="Target subject" required>
                <Select value={subjectId} onChange={e => setSubjectId(e.target.value)} aria-label="Subject"
                  options={subjects.map(s => ({ value: s.id, label: `${s.code} — ${s.name}` }))} />
              </FormField>

              <div className="u-flex" style={{ gap: 6, margin: '4px 0 12px' }}>
                <Button size="sm" variant={mode === 'file' ? 'primary' : 'outline'} onClick={() => setMode('file')}>Upload file</Button>
                <Button size="sm" variant={mode === 'text' ? 'primary' : 'outline'} onClick={() => setMode('text')}>Paste text</Button>
              </div>

              {mode === 'file' ? (
                <FileUploader onFileSelected={f => setFileName(f.name)} />
              ) : (
                <FormField label="Syllabus text" hint="Paste the official syllabus content including units, topics and learning outcomes.">
                  <Textarea rows={7} value={pastedText} onChange={e => setPastedText(e.target.value)}
                    placeholder={'Unit 1 — Introduction to Machine Learning\n- Types of ML\n- Supervised Learning ...'} />
                </FormField>
              )}

              <div style={{ marginTop: 14 }}>
                <Button onClick={runExtraction} disabled={running}>
                  {running ? <Loader2 size={14} className="spinner" aria-hidden /> : <ShieldCheck size={14} />}
                  {running ? 'Analyzing…' : 'Run AI structure extraction'}
                </Button>
              </div>
            </CardBody>
          </Card>

          <div style={{ display: 'grid', gap: 'var(--sp-3)', alignContent: 'start' }}>
            <Card>
              <CardHeader title="RAG pipeline" sub="Every stage runs inside the institution's boundary" />
              <CardBody>
                <div className="ai-pipeline">
                  {PIPELINE_STEPS.map((step, i) => (
                    <span key={step} className={`ai-step ${running || stepIndex >= 0
                      ? i <= stepIndex ? (i === PIPELINE_STEPS.length - 1 && !extracted ? 'active' : 'done') : 'pending' : 'pending'}`}>
                      {i <= stepIndex ? (i < stepIndex || extracted ? <CheckCircle2 size={13} /> : <Loader2 size={13} className="spinner" />) : <CircleDashed size={13} />}
                      {step}
                    </span>
                  ))}
                </div>
                <p className="u-xs u-muted">
                  Chunks are embedded with the institution's embedding model and stored in pgvector.
                  Retrieval is scoped to this subject's tenant — cross-institution context is impossible by construction.
                </p>
              </CardBody>
            </Card>

            {extracted && (
              <Card>
                <CardHeader title="Extracted structure — verify before storing"
                  sub="Compare against the official document. You are accountable for approval."
                  actions={<Button size="sm" variant="success" onClick={approveStructure}><CheckCircle2 size={13} /> Verified — submit</Button>} />
                <CardBody>
                  <div className="syllabus-tree">
                    {extracted.map(u => (
                      <div key={u.id} className="syllabus-unit">
                        <strong>Unit {u.number}: {u.title}</strong>
                        <span className="chip" style={{ marginLeft: 6 }}>{u.hours} hrs</span>
                        <span className="chip">{u.weightage}%</span>
                        {u.topics.map(t => (
                          <div key={t.id} className="syllabus-topic">
                            <div style={{ fontWeight: 600, fontSize: 'var(--fs-md)' }}>{t.title}</div>
                            {t.subtopics.map(st => <span key={st} className="chip">{st}</span>)}
                            {t.learningOutcomes.map(lo => (
                              <div key={lo} className="u-xs u-flex" style={{ color: 'var(--blue)' }}>
                                <FileText size={11} aria-hidden /> {lo}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      )}
    </>
  )
}

const DEMO_EXTRACTION: SyllabusUnit[] = [
  {
    id: 'ex-u1', number: 1, title: 'Introduction to Machine Learning', hours: 8, weightage: 15,
    topics: [
      { id: 'ex-t11', title: 'Foundations of ML', subtopics: ['Well-posed learning problems', 'Designing a learning system'], learningOutcomes: ['LO1: Formulate learning problems'] },
      { id: 'ex-t12', title: 'Types of Machine Learning', subtopics: ['Supervised learning', 'Unsupervised learning', 'Reinforcement learning'], learningOutcomes: ['LO2: Distinguish ML paradigms with examples'] },
    ],
  },
  {
    id: 'ex-u2', number: 2, title: 'Regression & Classification', hours: 10, weightage: 20,
    topics: [
      { id: 'ex-t21', title: 'Linear Regression', subtopics: ['Least squares', 'Gradient descent'], learningOutcomes: ['LO3: Derive and apply least-squares regression'] },
    ],
  },
]
