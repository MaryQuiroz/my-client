import { z } from 'zod'

export const scoringRequestSchema = z.object({
  businessId: z.string().uuid(),
  googleRating: z.number().optional().nullable(),
  googleReviewsCount: z.number().int().optional().nullable(),
})

export type ScoringRequestData = z.infer<typeof scoringRequestSchema>
