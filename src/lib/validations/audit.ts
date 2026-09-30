import { z } from 'zod'

export const auditRequestSchema = z.object({
  businessId: z.string().uuid(),
  scoreId: z.string().uuid(),
})

export type AuditRequestData = z.infer<typeof auditRequestSchema>
