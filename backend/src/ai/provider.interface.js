/* ============================================================
   AI Provider abstraction
   ------------------------------------------------------------
   The application depends on this interface only. Swapping LLM
   vendors is a config change (AI_PROVIDER env var), never a
   rewrite. Providers MUST return structured JSON matching the
   zod schemas in ./schemas.js — raw text is never trusted.
   ============================================================ */

export class AIProvider {
  /** Extract syllabus structure from raw document text. */
  async extractSyllabus(/* text, subjectHint */) {
    throw new Error('not implemented')
  }

  /** Generate exam questions as structured objects. */
  async generateQuestions(/* request */) {
    throw new Error('not implemented')
  }

  /** Evaluate a question for quality/ambiguity signals. */
  async evaluateQuestion(/* question */) {
    throw new Error('not implemented')
  }

  /** Embed text for semantic duplicate detection / RAG retrieval. */
  async embed(/* texts: string[] */) {
    throw new Error('not implemented')
  }
}
