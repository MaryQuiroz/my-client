import { describe, it, expect } from 'vitest'
import { buildMessagePrompt, type MessagePromptInput } from '@/lib/messages/prompt'

const baseInput: MessagePromptInput = {
  businessName: 'Peluquería Lucía',
  address: 'Madrid',
  channel: 'whatsapp',
  firedSignals: ['Sin web propia', 'Sin HTTPS'],
  totalScore: 40,
  freelancerName: 'Carlos Web',
  serviceDescription: 'Diseño y desarrollo de páginas web para negocios locales',
  servicePromise: 'Más clientes online en 30 días',
  communicationTone: 'informal',
  socialProof: '50 webs lanzadas en 2024',
}

describe('buildMessagePrompt', () => {
  it('el system prompt incluye serviceDescription del freelancer', () => {
    const { system } = buildMessagePrompt(baseInput)
    expect(system).toContain(baseInput.serviceDescription)
  })

  it('el user prompt incluye el nombre del negocio', () => {
    const { user } = buildMessagePrompt(baseInput)
    expect(user).toContain('Peluquería Lucía')
  })

  it('solo las señales fired aparecen en el user prompt', () => {
    const { user } = buildMessagePrompt(baseInput)
    expect(user).toContain('Sin web propia')
    expect(user).toContain('Sin HTTPS')
  })

  it('canal whatsapp → instrucción menciona 120 palabras', () => {
    const { user } = buildMessagePrompt({ ...baseInput, channel: 'whatsapp' })
    expect(user).toContain('120')
  })

  it('canal email → instrucción menciona asunto', () => {
    const { user } = buildMessagePrompt({ ...baseInput, channel: 'email' })
    expect(user.toLowerCase()).toContain('asunto')
  })

  it('canal llamada → instrucción menciona guion', () => {
    const { user } = buildMessagePrompt({ ...baseInput, channel: 'llamada' })
    expect(user.toLowerCase()).toContain('guion')
  })

  it('sin socialProof → system prompt no incluye prueba social', () => {
    const { system } = buildMessagePrompt({ ...baseInput, socialProof: null })
    expect(system).not.toContain('Prueba social')
    expect(system).not.toContain('50 webs')
  })

  it('sin señales disparadas → user prompt refleja que no hay problemas', () => {
    const { user } = buildMessagePrompt({ ...baseInput, firedSignals: [] })
    expect(user).toContain('No se han detectado')
  })

  it('firedSignals vacío → no lanza excepción', () => {
    expect(() => buildMessagePrompt({ ...baseInput, firedSignals: [] })).not.toThrow()
  })

  it('el system prompt incluye instrucción de honestidad', () => {
    const { system } = buildMessagePrompt(baseInput)
    expect(system).toContain('ÚNICAMENTE')
  })
})
