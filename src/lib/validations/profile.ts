import { z } from 'zod'

export const COMMUNICATION_TONES = ['profesional', 'cercano', 'directo', 'formal'] as const
export type CommunicationTone = (typeof COMMUNICATION_TONES)[number]

// Schema del formulario: sin transforms para compatibilidad con react-hook-form.
// La conversión de '' → null se hace en la API route antes de guardar en BD.
export const profileSchema = z.object({
  service_description: z
    .string()
    .min(10, 'Describe tu servicio con al menos 10 caracteres')
    .max(500, 'Máximo 500 caracteres'),
  service_promise: z.string().max(300, 'Máximo 300 caracteres').optional(),
  social_proof: z.string().max(500, 'Máximo 500 caracteres').optional(),
  ideal_client: z.string().max(300, 'Máximo 300 caracteres').optional(),
  communication_tone: z.enum(COMMUNICATION_TONES, {
    message: 'Selecciona un tono de comunicación',
  }),
  business_name: z.string().max(100, 'Máximo 100 caracteres').optional(),
  logo_url: z
    .string()
    .max(500)
    .optional()
    .refine((v) => !v || isValidUrl(v), { message: 'Introduce una URL válida' }),
})

export type ProfileFormData = z.infer<typeof profileSchema>

// Convierte los campos opcionales vacíos a null para la base de datos
export function toDbProfile(data: ProfileFormData): Record<string, unknown> {
  return {
    service_description: data.service_description,
    service_promise: data.service_promise || null,
    social_proof: data.social_proof || null,
    ideal_client: data.ideal_client || null,
    communication_tone: data.communication_tone,
    business_name: data.business_name || null,
    logo_url: data.logo_url || null,
  }
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}
