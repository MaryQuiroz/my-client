import { z } from 'zod'

export const searchSchema = z.object({
  query: z.string().min(1, 'Introduce el tipo de negocio').max(100),
  location: z.string().min(1, 'Introduce la zona o ciudad').max(100),
  radius: z.number().int().min(100).max(50000).optional(),
  maxResults: z.number().int().min(1).max(20).optional(),
})

export type SearchFormData = z.infer<typeof searchSchema>
