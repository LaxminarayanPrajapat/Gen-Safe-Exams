/* Gemini provider — same contract as OpenAIProvider. */
import { AIProvider } from './provider.interface.js'

export class GeminiProvider extends AIProvider {
  constructor({ apiKey, model }) {
    super()
    this.apiKey = apiKey
    this.model = model
  }

  async #generate(system, user, schema) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ parts: [{ text: user }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: schema,
          },
        }),
      },
    )
    if (!res.ok) throw new Error(`AI provider error ${res.status}`)
    const data = await res.json()
    return JSON.parse(data.candidates[0].content.parts[0].text)
  }

  async extractSyllabus(text, subjectHint) {
    return this.#generate('Parse the syllabus faithfully. Return only what is present.', text, { type: 'object' })
  }
  async generateQuestions(request) {
    return this.#generate('Generate exam questions per constraints.', JSON.stringify(request), { type: 'object' })
  }
  async evaluateQuestion(question) {
    return this.#generate('Evaluate question quality.', JSON.stringify(question), { type: 'object' })
  }
}
