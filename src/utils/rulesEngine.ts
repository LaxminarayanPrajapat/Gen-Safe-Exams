/* ============================================================
   GEN SAFE EXAM — Blueprint rules engine (client mirror)
   ------------------------------------------------------------
   In production these checks run server-side in
   backend/src/services/rulesEngine.service.js before any AI
   output is accepted. The client copy exists so the UI can
   give instant feedback; the server remains authoritative.
   ============================================================ */
import type { ExamBlueprint, SectionSpec, Question, PaperSet } from '@/types'

export interface RuleIssue {
  rule: string
  level: 'error' | 'warning'
  message: string
}

const EPS = 0.01

/** Validate a blueprint's internal consistency. */
export function validateBlueprint(bp: Pick<ExamBlueprint, 'sections' | 'difficultyDistribution' | 'unitWeightage' | 'totalMarks'>): RuleIssue[] {
  const issues: RuleIssue[] = []
  const sectionTotal = bp.sections.reduce((s, sec) => s + sec.questionCount * sec.marksPerQuestion, 0)
  if (Math.abs(sectionTotal - bp.totalMarks) > EPS) {
    issues.push({
      rule: 'TOTAL_MARKS_MATCH',
      level: 'error',
      message: `Sections total ${sectionTotal} marks but paper declares ${bp.totalMarks}.`,
    })
  }
  const diffSum = bp.difficultyDistribution.Easy + bp.difficultyDistribution.Medium + bp.difficultyDistribution.Hard
  if (Math.abs(diffSum - 100) > EPS) {
    issues.push({ rule: 'DIFFICULTY_SUM_100', level: 'error', message: `Difficulty distribution sums to ${diffSum}% (must be 100%).` })
  }
  const unitSum = Object.values(bp.unitWeightage).reduce((a, b) => a + b, 0)
  if (unitSum > 0 && Math.abs(unitSum - 100) > 1) {
    issues.push({ rule: 'UNIT_WEIGHT_SUM_100', level: 'error', message: `Unit weightage sums to ${Math.round(unitSum)}% (must be ~100%).` })
  }
  for (const sec of bp.sections) {
    if (sec.questionCount <= 0) issues.push({ rule: 'SECTION_COUNT_POSITIVE', level: 'error', message: `${sec.name} must contain at least one question.` })
    if (sec.marksPerQuestion <= 0) issues.push({ rule: 'SECTION_MARKS_POSITIVE', level: 'error', message: `${sec.name} marks per question must be positive.` })
    if (sec.types.length === 0) issues.push({ rule: 'SECTION_TYPE_REQUIRED', level: 'warning', message: `${sec.name} has no question types selected.` })
    const choiceMatch = /any\s+(\d+)\s+of\s+(\d+)/i.exec(sec.choiceStructure ?? '')
    if (choiceMatch && parseInt(choiceMatch[2]) < parseInt(choiceMatch[1])) {
      issues.push({ rule: 'CHOICE_STRUCTURE_VALID', level: 'error', message: `${sec.name} choice structure is invalid (${choiceMatch[2]} < ${choiceMatch[1]}).` })
    }
  }
  return issues
}

/**
 * Check whether a candidate set of questions satisfies the blueprint.
 * Returns violations the generator must fix before a paper may be submitted.
 */
export function validateGeneratedPaper(
  blueprint: ExamBlueprint,
  sets: PaperSet[],
  pool: Question[],
): RuleIssue[] {
  const issues: RuleIssue[] = []
  const byId = new Map(pool.map(q => [q.id, q]))
  const setA = sets[0]
  if (!setA) { issues.push({ rule: 'SET_PRESENT', level: 'error', message: 'At least one set is required.' }); return issues }

  // Section totals
  for (const sec of blueprint.sections) {
    const count = setA.questions.filter(pq => pq.section === sec.name).length
    if (count !== sec.questionCount) {
      issues.push({ rule: 'SECTION_FILL', level: 'error', message: `${sec.name}: ${count}/${sec.questionCount} questions placed.` })
    }
  }
  // Total marks
  const marks = setA.questions.reduce((s, pq) => s + pq.marks, 0)
  if (marks !== blueprint.totalMarks) {
    issues.push({ rule: 'TOTAL_MARKS_MATCH', level: 'error', message: `Placed questions total ${marks} of ${blueprint.totalMarks} marks.` })
  }
  // Difficulty split within ±5% tolerance
  const diffCount = { Easy: 0, Medium: 0, Hard: 0 }
  setA.questions.forEach(pq => {
    const q = byId.get(pq.questionId)
    if (q) diffCount[q.difficulty]++
  })
  const totalQ = setA.questions.length || 1
  ;(Object.keys(diffCount) as (keyof typeof diffCount)[]).forEach(d => {
    const actualPct = (diffCount[d] / totalQ) * 100
    const target = blueprint.difficultyDistribution[d]
    if (Math.abs(actualPct - target) > 6) {
      issues.push({ rule: 'DIFFICULTY_DISTRIBUTION', level: 'warning', message: `${d} share ${Math.round(actualPct)}% vs target ${target}% (±6% allowed).` })
    }
  })
  // No duplicate questions inside one set
  const ids = setA.questions.map(pq => pq.questionId)
  if (new Set(ids).size !== ids.length) {
    issues.push({ rule: 'NO_DUPLICATES_IN_SET', level: 'error', message: 'Duplicate question found within a single set.' })
  }
  // Sets equivalence: same section structure and equal marks
  const refMarks = JSON.stringify(sortedMarks(setA))
  for (const other of sets.slice(1)) {
    if (JSON.stringify(sortedMarks(other)) !== refMarks) {
      issues.push({ rule: 'SET_EQUIVALENCE', level: 'error', message: `Set ${other.label} does not match Set A structure.` })
    }
  }
  return issues
}

function sortedMarks(set: PaperSet): number[] {
  return [...set.questions].sort((a, b) => a.order - b.order).map(q => q.marks)
}
