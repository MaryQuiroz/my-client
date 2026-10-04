import type { SectorHint } from './sector-hints'

export interface MessagePromptInput {
  businessName: string
  address: string
  channel: 'whatsapp' | 'llamada' | 'email'
  firedSignals: string[]
  totalScore: number
  freelancerName: string
  serviceDescription: string
  servicePromise: string | null
  communicationTone: string
  socialProof: string | null
  sectorHint?: SectorHint | null
}

const CHANNEL_INSTRUCTIONS: Record<MessagePromptInput['channel'], string> = {
  whatsapp:
    'Escribe un mensaje de WhatsApp directo y natural. Máximo 120 palabras. Sin asunto. Empieza con un saludo informal.',
  email:
    'Escribe un email de prospección. La primera línea es el asunto (empieza con "Asunto:"), luego una línea en blanco, luego el cuerpo. Máximo 200 palabras en total.',
  llamada:
    'Escribe un guion de llamada de prospección. Incluye: presentación breve, gancho principal y 3 puntos clave que mencionar. Máximo 150 palabras.',
}

export function buildMessagePrompt(input: MessagePromptInput): {
  system: string
  user: string
} {
  const toneClause =
    input.communicationTone === 'formal'
      ? 'Usa un tono profesional y formal.'
      : 'Usa un tono cercano e informal.'

  const proofClause = input.socialProof
    ? `Prueba social del freelancer (opcional, solo úsala si encaja de forma natural): "${input.socialProof}".`
    : ''

  const promiseClause = input.servicePromise
    ? `Propuesta de valor: "${input.servicePromise}".`
    : ''

  const sectorClause = input.sectorHint
    ? `Sector del negocio: ${input.sectorHint.keywords[0]}, con los siguientes puntos de dolor típicos: ${input.sectorHint.painPoints.join(', ')}.`
    : ''

  const system = [
    `Eres un asistente de ventas para ${input.freelancerName || 'un freelancer web'}.`,
    `Servicio ofrecido: ${input.serviceDescription}.`,
    promiseClause,
    proofClause,
    sectorClause,
    toneClause,
    'REGLA IMPORTANTE: usa ÚNICAMENTE los datos que te proporciono. No inventes nombres de personas, teléfonos, emails, precios, ni ningún otro dato del negocio. Si no tienes un dato, no lo menciones.',
  ]
    .filter(Boolean)
    .join(' ')

  const signalsText =
    input.firedSignals.length > 0
      ? `Problemas web detectados: ${input.firedSignals.join(', ')}.`
      : 'No se han detectado problemas web específicos.'

  const sectorUserClause = input.sectorHint
    ? `Propuestas de valor relevantes para este sector: ${input.sectorHint.valueProps.join(', ')}. Puedes usar como inspiración (no literalmente): "${input.sectorHint.exampleOpener}".`
    : ''

  const user = [
    `Negocio objetivo: "${input.businessName}"${input.address ? ` (${input.address})` : ''}.`,
    signalsText,
    `Puntuación de oportunidad: ${input.totalScore}/100.`,
    sectorUserClause,
    CHANNEL_INSTRUCTIONS[input.channel],
    'Escribe solo el mensaje, sin explicaciones adicionales ni comentarios.',
  ]
    .filter(Boolean)
    .join('\n')

  return { system, user }
}
