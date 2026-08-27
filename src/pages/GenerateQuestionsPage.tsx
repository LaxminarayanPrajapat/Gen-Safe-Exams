import { useState } from 'react'
import { Sparkles, Loader2, CheckCircle2, AlertTriangle, XCircle, PlusCircle, ShieldCheck } from 'lucide-react'
import {
  Card, CardHeader, CardBody, Button, FormField, Select, Input, Textarea,
  StatusBadge, EmptyState,
} from '@/components/ui'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'
import { subjects, syllabi } from '@/data/demo'
import type { QuestionType, Difficulty, BloomLevel } from '@/types'
import { questionTypeLabel } from '@/utils'

/* ============================================================
   AI QUESTION GENERATION (DEMO MODE)
   ------------------------------------------------------------
   In production this page calls POST /api/questions/generate.
   The backend runs the configured AIProvider (OpenAI / Gemini)
   with structured-output schemas + RAG context from the approved
   syllabus, then applies the server-side rules engine BEFORE any
   result is returned. The UI never talks to an LLM directly and
   holds no API keys.
   ============================================================ */

interface GeneratedQuestion {
  id: string
  text: string
  type: QuestionType
  difficulty: Difficulty
  bloom: BloomLevel
  marks: number
  topic: string
  learningOutcome: string
  duplicateScore: number
  validationScore: number
}

interface ValidationCheck { name: string; state: 'pass' | 'warn' | 'fail'; detail: string }

const DEMO_TEMPLATES: Record<string, string[]> = {
  DESCRIPTIVE: [
    'Explain the working principle of {topic}. Support your answer with a labelled diagram and one real-world application.',
    'Discuss the key characteristics of {topic} and analyse how they influence system behaviour in practice.',
  ],
  SHORT_ANSWER: [
    'Define {topic} and state its two most important properties.',
    'List the main components involved in {topic}, briefly stating the role of each.',
  ],
  NUMERICAL: [
    'A system based on {topic} is given with parameters X=12 and Y=4. Compute the required output showing all steps.',
    'For the dataset associated with {topic}, calculate the requested measure and interpret the result.',
  ],
  PROBLEM_SOLVING: [
    'Given the following scenario involving {topic}, construct a step-by-step solution and justify each step.',
    'Apply {topic} to the supplied case data; identify the correct approach and derive the final answer.',
  ],
  MCQ: [
    'Which of the following statements best describes {topic}? (A) … (B) … (C) … (D) …',
  ],
  CASE_STUDY: [
    'An organisation must adopt a solution based on {topic}. Propose a design, discuss trade-offs and justify your recommendation.',
  ],
}

export default function GenerateQuestionsPage() {
  const toast = useToast()
  const { user } = useAuth()

  const [subjectId, setSubjectId] = useState(subjects[0].id)
  const [unit, setUnit] = useState('1')
  const [type, setType] = useState<QuestionType>('DESCRIPTIVE')
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium')
  const [bloom, setBloom] = useState<BloomLevel>('Understand')
  const [marks, setMarks] = useState('5')
  const [count, setCount] = useState('3')
  const [outcome, setOutcome] = useState('')
  const [notes, setNotes] = useState('')

  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<GeneratedQuestion[] | null>(null)
  const [checks, setChecks] = useState<ValidationCheck[]>([])

  const subject = subjects.find(s => s.id === subjectId)!
  const syl = syllabi.find(s => s.subjectId === subjectId)
  const unitObj = syl?.units.find(u => String(u.number) === unit)

  const generate = async () => {
    setRunning(true); setResults(null); setChecks([])
    await new Promise(r => setTimeout(r, 1400)) // simulated provider latency

    // Deterministic demo output — clearly marked as demo mode.
    const templates = DEMO_TEMPLATES[type] ?? DEMO_TEMPLATES.SHORT_ANSWER
    const n = Math.min(6, Math.max(1, parseInt(count)))
    const generated: GeneratedQuestion[] = Array.from({ length: n }, (_, i) => ({
      id: `q-gen-${Date.now().toString().slice(-5)}-${i}`,
      text: templates[i % templates.length].replaceAll('{topic}', unitObj?.topics[i % Math.max(1, unitObj.topics.length)]?.title ?? 'the selected topic'),
      type, difficulty, bloom, marks: parseInt(marks),
      topic: unitObj?.topics[i % Math.max(1, unitObj.topics.length)]?.title ?? unitObj?.title ?? '',
      learningOutcome: outcome || unitObj?.topics[0]?.learningOutcomes[0] || '',
      duplicateScore: Number((0.08 + ((i * 7) % 10) * 0.02).toFixed(2)),
      validationScore: [96, 93, 88, 95, 91][i % 5],
    }))

    setChecks([
      { name: 'Syllabus relevance', state: 'pass', detail: `All questions map to approved Unit ${unit}: ${unitObj?.title ?? ''}` },
      { name: 'Semantic duplicate detection', state: generated.some(g => g.duplicateScore >= 0.2) ? 'warn' : 'pass', detail: 'pgvector similarity vs bank — highest score ' + Math.max(...generated.map(g => g.duplicateScore)).toFixed(2) + ' (reject threshold 0.85)' },
      { name: 'Difficulty & Bloom consistency', state: 'pass', detail: `${difficulty} · ${bloom} consistent across ${n} questions` },
      { name: 'Marks suitability', state: parseInt(marks) > 8 && bloom === 'Remember' ? 'warn' : 'pass', detail: `${marks} marks for ${questionTypeLabel[type]} at Bloom ${bloom}` },
      { name: 'Grammar & ambiguity screening', state: 'pass', detail: 'Language model check passed on all candidates' },
      { name: 'Technical correctness spot-check', state: 'pass', detail: 'Reference answers verified against retrieval context' },
    ])
    setResults(generated)
    setRunning(false)
  }

  const addToBank = () => {
    toast.push('info', 'Sent for human review',
      `${results?.length ?? 0} candidate questions stored as PENDING_REVIEW in your department scope. They are NOT usable in papers until a reviewer approves them.`)
    setResults(null); setChecks([])
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>AI question generation</h1>
          <p className="page-desc">
            Generation is constrained by schema + rules engine + duplicate detection. Output lands in a review queue —
            <strong> AI never approves its own questions</strong>.
          </p>
        </div>
        <span className="badge badge-navy"><ShieldCheck size={12} aria-hidden /> Provider: institution-configured LLM</span>
      </div>

      <div className="dash-grid">
        <Card>
          <CardHeader title="Generation request" sub="All inputs are validated against the approved syllabus before dispatch" />
          <CardBody>
            <div className="form-row">
              <FormField label="Subject" required>
                <Select value={subjectId} onChange={e => { setSubjectId(e.target.value); setUnit('1') }} aria-label="Subject"
                  options={subjects.filter(s => !['UNIVERSITY_EXAM_CONTROLLER'].includes(user?.role ?? '')).map(s => ({ value: s.id, label: `${s.code} — ${s.name}` }))} />
              </FormField>
              <FormField label="Unit" required>
                <Select value={unit} onChange={e => setUnit(e.target.value)} aria-label="Unit"
                  options={(syl?.units ?? []).map(u => ({ value: String(u.number), label: `Unit ${u.number} — ${u.title}` }))} />
              </FormField>
            </div>

            <div className="form-row">
              <FormField label="Question type" required>
                <Select value={type} onChange={e => setType(e.target.value as QuestionType)} aria-label="Question type"
                  options={Object.entries(questionTypeLabel).map(([v, l]) => ({ value: v, label: l }))} />
              </FormField>
              <FormField label="Difficulty" required>
                <Select value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)} aria-label="Difficulty"
                  options={['Easy', 'Medium', 'Hard']} />
              </FormField>
            </div>

            <div className="form-row">
              <FormField label="Bloom level" required>
                <Select value={bloom} onChange={e => setBloom(e.target.value as BloomLevel)} aria-label="Bloom level"
                  options={['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create']} />
              </FormField>
              <FormField label="Marks per question" required>
                <Input type="number" min={1} max={20} value={marks} onChange={e => setMarks(e.target.value)} />
              </FormField>
              <FormField label="How many?" required hint="Max 6 per batch">
                <Input type="number" min={1} max={6} value={count} onChange={e => setCount(e.target.value)} />
              </FormField>
            </div>

            <FormField label="Target learning outcome" hint="Leave blank to let the engine pick from the approved unit outcomes.">
              <Input value={outcome} onChange={e => setOutcome(e.target.value)}
                placeholder={unitObj?.topics[0]?.learningOutcomes[0] ?? 'LO: …'} readOnly={!unitObj} />
            </FormField>

            <FormField label="Additional instructions for the model" hint="Treated as guidance only — rules still apply.">
              <Textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g., avoid numerical examples longer than 5 steps; align terminology with prescribed textbook." />
            </FormField>

            <Button onClick={generate} disabled={running}>
              {running ? <Loader2 size={14} className="spinner" aria-hidden /> : <Sparkles size={14} />}
              {running ? 'Generating & validating…' : 'Generate questions'}
            </Button>
          </CardBody>
        </Card>

        <div style={{ display: 'grid', gap: 'var(--sp-3)', alignContent: 'start' }}>
          <Card>
            <CardHeader title="Automated validation pipeline" sub="Runs before any question reaches a human" />
            <CardBody>
              {checks.length === 0 ? (
                <EmptyState icon={ShieldCheck} title="No run yet"
                  description="Submit a generation request. Each candidate is checked against ten rule families before display." />
              ) : (
                <div className="check-list">
                  {checks.map(c => (
                    <span key={c.name} className={`check-item ${c.state}`}>
                      {c.state === 'pass' ? <CheckCircle2 /> : c.state === 'warn' ? <AlertTriangle /> : <XCircle />}
                      <span><strong>{c.name}</strong> — <span className="u-muted">{c.detail}</span></span>
                    </span>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card flush>
            <CardHeader title="Generated candidates"
              sub={results ? 'Pending your submission into the review queue' : 'Candidates appear here after validation'}
              actions={results && <Button size="sm" variant="success" onClick={addToBank}><PlusCircle size={13} /> Send to review queue</Button>} />
            {!results ? (
              <CardBody>{!running && <EmptyState icon={Sparkles} title="Nothing generated yet" description="Configure the request on the left and run generation." />}</CardBody>
            ) : (
              <CardBody>
                {results.map(q => (
                  <div key={q.id} className="generated-question">
                    <div style={{ fontSize: 'var(--fs-base)', lineHeight: 1.55 }}>{q.text}</div>
                    <div className="gq-meta">
                      <StatusBadge tone="navy">{q.topic}</StatusBadge>
                      <StatusBadge tone={q.difficulty === 'Easy' ? 'green' : q.difficulty === 'Medium' ? 'amber' : 'red'}>{q.difficulty}</StatusBadge>
                      <StatusBadge tone="blue">{q.bloom}</StatusBadge>
                      <span className="badge badge-outline">{q.marks} marks</span>
                      <span className={`badge ${q.duplicateScore >= 0.2 ? 'badge-amber' : 'badge-green'}`}>
                        dup {(q.duplicateScore).toFixed(2)}
                      </span>
                      <span className={`badge ${q.validationScore >= 90 ? 'badge-green' : 'badge-amber'}`}>
                        score {q.validationScore}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="alert-banner info" style={{ marginTop: 12 }}>
                  <ShieldCheck size={15} aria-hidden /> Demo mode: candidates above are deterministic placeholders. Production output comes from the backend AI service with structured JSON schemas and full provenance.
                </div>
              </CardBody>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
