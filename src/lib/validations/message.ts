import { z } from 'zod'

export const messageRequestSchema = z.object({
  businessId: z.string().uuid(),
  scoreId: z.string().uuid(),
  channel: z.enum(['whatsapp', 'llamada', 'email']),
  sectorOverride: z.string().max(50).optional(),
})

export const messageCopySchema = z.object({
  messageId: z.string().uuid(),
})

export type MessageRequestData = z.infer<typeof messageRequestSchema>
export type MessageChannel = z.infer<typeof messageRequestSchema>['channel']
