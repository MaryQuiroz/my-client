import Anthropic from '@anthropic-ai/sdk'
import { buildMessagePrompt, type MessagePromptInput } from './prompt'

export async function generateMessage(
  input: MessagePromptInput,
  apiKey: string
): Promise<string> {
  const client = new Anthropic({ apiKey })
  const { system, user } = buildMessagePrompt(input)

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    system,
    messages: [{ role: 'user', content: user }],
  })

  const block = response.content[0]
  if (block.type !== 'text') {
    throw new Error('Respuesta inesperada del modelo')
  }

  return block.text.trim()
}
