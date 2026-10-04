import { z } from 'zod'

export const manualBusinessSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio (mínimo 2 caracteres)').max(200),
  website: z
    .string()
    .max(500)
    .optional()
    .refine((v) => !v || isValidUrl(v), { message: 'Introduce una URL válida (ej: https://sunegocio.com)' }),
  category: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
  address: z.string().max(300).optional(),
})

export type ManualBusinessData = z.infer<typeof manualBusinessSchema>

function isValidUrl(value: string): boolean {
  try {
    new URL(value.startsWith('http') ? value : `https://${value}`)
    return true
  } catch {
    return false
  }
}

export function normalizeUrl(value: string): string {
  if (!value) return value
  return value.startsWith('http') ? value : `https://${value}`
}
