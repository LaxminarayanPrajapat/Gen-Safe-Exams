/* OpenAI provider implementation (structured outputs / JSON schema mode). */
import { AIProvider } from './provider.interface.js'

export class OpenAIProvider extends AIProvider {
  constructor({ apiKey, model, embeddingModel }) {
    super()
    this.apiKey = apiKey
    this.model = model
    this.embeddingModel = embeddingModel
  }

  async #chat(system, user, schema) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: { name: schema.title, strict: true, schema },
        },
        temperature: 0.4,
      }),
    })
    if (!res.ok) throw new Error(`AI provider error ${res.status}`)
    const data = await res.json()
    return JSON.parse(data.choices[0].message.content)
  }

  async extractSyllabus(text, subjectHint) {
    return this.#chat(SYLLABUS_SYSTEM, text + (subjectHint ? `\n\nSubject hint: ${subjectHint}` : ''), syllabusSchema)
  }

  async generateQuestions(request) {
    return this.#chat(GENERATION_SYSTEM, JSON.stringify(request), questionBatchSchema)
  }

  async evaluateQuestion(question) {
    return this.#chat(EVALUATION_SYSTEM, JSON.stringify(question), evaluationSchema)
  }

  async embed(texts) {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.embeddingModel, input: texts }),
    })
    if (!res.ok) throw new Error(`Embedding error ${res.status}`)
    const data = await res.json()
    return data.data.map(d => d.embedding)
  }
}

/* ---- prompt contracts (abridged; full versions live in prompts/) ---- */
const SYLLABUS_SYSTEM =
  'You are an academic syllabus parser for Indian universities. Return ONLY the structure present in the document. Never invent units or topics. Use the provided JSON schema.'

const GENERATION_SYSTEM =
  'You generate examination questions strictly from the supplied approved-syllabus context. Follow the requested type, marks, difficulty and Bloom level exactly. Output per the JSON schema.'

const EVALUATION_SYSTEM =
  'You are a strict exam reviewer. Score the question for grammar, ambiguity, technical correctness and level fit using the JSON schema.'

const syllabusSchema = {
  type: 'object',
  required: ['units'],
  properties: {
    units: {
      type: 'array',
      items: {
        type: 'object',
        required: ['number', 'title', 'topics'],
        properties: {
          number: { type: 'integer' },
          title: { type: 'string' },
          hours: { type: 'number' },
          weightage: { type: 'number' },
          topics: {
            type: 'array',
            items: {
              type: 'object',
              required: ['title'],
              properties: {
                title: { type: 'string' },
                subtopics: { type: 'array', items: { type: 'string' } },
                learningOutcomes: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
      },
    },
  },
}

const questionBatchSchema = {
  type: 'object',
  required: ['questions'],
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        required: ['text', 'type', 'difficulty', 'bloom', 'marks', 'topic'],
        properties: {
          text: { type: 'string' },
          topic: { type: 'string' },
          type: { enum: ['MCQ', 'TRUE_FALSE', 'FILL_BLANK', 'SHORT_ANSWER', 'DESCRIPTIVE', 'NUMERICAL', 'PROGRAMMING', 'CASE_STUDY', 'PROBLEM_SOLVING', 'PRACTICAL'] },
          difficulty: { enum: ['Easy', 'Medium', 'Hard'] },
          bloom: { enum: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'] },
          marks: { type: 'integer' },
          referenceAnswer: { type: 'string' },
          learningOutcome: { type: 'string' },
        },
      },
    },
  },
}

const evaluationSchema = {
  type: 'object',
  required: ['grammarScore', 'ambiguityScore', 'technicalScore', 'notes'],
  properties: {
    grammarScore: { type: 'number' },
    ambiguityScore: { type: 'number' },
    technicalScore: { type: 'number' },
    notes: { type: 'string' },
  },
}
