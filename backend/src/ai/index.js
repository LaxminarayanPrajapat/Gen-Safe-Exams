/* Provider factory — swap vendors via AI_PROVIDER env var. */
import { OpenAIProvider } from './openai.provider.js'
import { GeminiProvider } from './gemini.provider.js'

export function createAiProvider(config) {
  switch (config.aiProvider) {
    case 'openai':
      return new OpenAIProvider({
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.AI_MODEL ?? 'gpt-4.1',
        embeddingModel: process.env.EMBEDDING_MODEL ?? 'text-embedding-3-small',
      })
    case 'gemini':
      return new GeminiProvider({ apiKey: process.env.GEMINI_API_KEY, model: process.env.AI_MODEL ?? 'gemini-2.0-flash' })
    default:
      throw new Error(`Unknown AI_PROVIDER '${config.aiProvider}'`)
  }
}

export const ai = createAiProvider(await import('../config/env.js').then(m => m.config))
