/* ============================================================
   Server-side rules engine — THE authoritative gatekeeper.
   No AI output reaches the database or a paper without passing
   these checks. The React app mirrors this for UX only.
   ============================================================ */

const EPS = 0.01

export function validateBlueprint(bp) {
  const issues = []
  const sectionTotal = bp.sections.reduce((s, x) => s + x.questionCount * x.marksPerQuestion, 0)
  if (Math.abs(sectionTotal - bp.totalMarks) > EPS) {
    issues.push({ rule: 'TOTAL_MARKS_MATCH', level: 'error', message: `Sections total ${sectionTotal} ≠ ${bp.totalMarks}` })
  }
  const diffSum = bp.difficultyDistribution.Easy + bp.difficultyDistribution.Medium + bp.difficultyDistribution.Hard
  if (Math.abs(diffSum - 100) > EPS) {
    issues.push({ rule: 'DIFFICULTY_SUM_100', level: 'error', message: `Difficulty sums to ${diffSum}%` })
  }
  return issues
}

export function validateGeneratedQuestions(candidate, approvedSyllabus) {
  const failures = []
  // 1. Topic must exist in the APPROVED syllabus — hallucinated topics are rejected.
  const topicExists = approvedSyllabus.units.some(u =>
    u.topics.some(t => t.title.toLowerCase() === candidate.topic.toLowerCase()))
  if (!topicExists) failures.push('SYLLABUS_RELEVANCE')
  // 2. Marks / type sanity
  if (candidate.marks < 1 || candidate.marks > 20) failures.push('MARKS_RANGE')
  // 3. Bloom/difficulty pairing heuristics
  if (candidate.bloom === 'Remember' && candidate.difficulty === 'Hard') failures.push('LEVEL_MISMATCH')
  return failures
}

/** Semantic duplicate detection via pgvector cosine similarity. */
export async function findDuplicates(pool, embedding, organizationId, threshold = 0.85) {
  const { rows } = await pool.query(
    `SELECT q.id, q.text, 1 - (qe.embedding <=> $1::vector) AS similarity
       FROM question_embeddings qe
       JOIN questions q ON q.id = qe.question_id
      WHERE q.organization_id = $2 AND q.status != 'REJECTED'
      ORDER BY similarity DESC
      LIMIT 5`,
    [JSON.stringify(embedding), organizationId],
  )
  return rows.filter(r => r.similarity >= threshold)
}

export function validateGeneratedPaper(blueprint, sets) {
  const issues = []
  const first = sets[0]
  const marks = first.questions.reduce((s, q) => s + q.marks, 0)
  if (marks !== blueprint.totalMarks) {
    issues.push({ rule: 'TOTAL_MARKS_MATCH', level: 'error', message: `Placed ${marks} of ${blueprint.totalMarks} marks` })
  }
  for (const set of sets.slice(1)) {
    if (set.questions.length !== first.questions.length) {
      issues.push({ rule: 'SET_EQUIVALENCE', level: 'error', message: `Set ${set.label} structure mismatch` })
    }
  }
  return issues
}
