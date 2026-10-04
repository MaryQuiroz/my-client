import { z } from 'zod'

export const proposalRequestSchema = z.object({
  businessId: z.string().uuid(),
  scoreId: z.string().uuid().optional(),
  solutionTitle: z.string().min(3).max(200),
  solutionDescription: z.string().min(10).max(1000),
  price: z.number().int().min(1).max(100000),
  deliveryWeeks: z.number().int().min(1).max(52).default(3),
  includesHosting: z.boolean().default(false),
  includesSeo: z.boolean().default(false),
})

export type ProposalRequestData = z.infer<typeof proposalRequestSchema>
