/* ============================================================
   GEN SAFE EXAM — shared utilities
   ============================================================ */
import type { Difficulty, BloomLevel, QuestionType } from '@/types'

export function formatDate(iso: string, withTime = false): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const date = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  if (!withTime) return date
  return `${date}, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(iso)
}

export function initials(name: string): string {
  const clean = name.replace(/^(Dr\.|Prof\.|CA|Mr\.|Ms\.)\s*/i, '')
  return clean.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

export function pct(n: number): string { return `${Math.round(n)}%` }

export const difficultyTone: Record<Difficulty, string> = { Easy: 'green', Medium: 'amber', Hard: 'red' }
export const difficultyColor: Record<Difficulty, string> = { Easy: '#287D5A', Medium: '#9A6B18', Hard: '#B5473C' }
export const bloomColors: Record<BloomLevel, string> = {
  Remember: '#6C7D8D', Understand: '#2F6B9A', Apply: '#287D5A',
  Analyze: '#9A6B18', Evaluate: '#B5473C', Create: '#102A43',
}
export const questionTypeLabel: Record<QuestionType, string> = {
  MCQ: 'MCQ', TRUE_FALSE: 'True/False', FILL_BLANK: 'Fill in the Blanks',
  SHORT_ANSWER: 'Short Answer', DESCRIPTIVE: 'Descriptive', NUMERICAL: 'Numerical',
  PROGRAMMING: 'Programming', CASE_STUDY: 'Case Study', PROBLEM_SOLVING: 'Problem Solving',
  PRACTICAL: 'Practical',
}

/** Deterministic pseudo-random hash — demo mode only. */
export function hashSeed(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s
  }
  const csv = rows.map(r => r.map(escape).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function sleep(ms: number): Promise<void> {
  return new Promise(res => setTimeout(res, ms))
}
