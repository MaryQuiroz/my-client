import { describe, it, expect } from 'vitest'
import { profileSchema, toDbProfile } from '@/lib/validations/profile'

const perfil_valido = {
  service_description: 'Diseño y desarrollo de páginas web para negocios locales',
  communication_tone: 'profesional' as const,
}

describe('profileSchema', () => {
  it('acepta un perfil con solo los campos obligatorios', () => {
    const result = profileSchema.safeParse(perfil_valido)
    expect(result.success).toBe(true)
  })

  it('rechaza service_description vacío', () => {
    const result = profileSchema.safeParse({ ...perfil_valido, service_description: '' })
    expect(result.success).toBe(false)
  })

  it('rechaza service_description menor de 10 caracteres', () => {
    const result = profileSchema.safeParse({ ...perfil_valido, service_description: 'Webs' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.service_description).toBeDefined()
    }
  })

  it('rechaza service_description mayor de 500 caracteres', () => {
    const largo = 'a'.repeat(501)
    const result = profileSchema.safeParse({ ...perfil_valido, service_description: largo })
    expect(result.success).toBe(false)
  })

  it('acepta service_promise vacío (opcional)', () => {
    const result = profileSchema.safeParse({ ...perfil_valido, service_promise: '' })
    expect(result.success).toBe(true)
  })

  it('rechaza service_promise mayor de 300 caracteres', () => {
    const largo = 'a'.repeat(301)
    const result = profileSchema.safeParse({ ...perfil_valido, service_promise: largo })
    expect(result.success).toBe(false)
  })

  it('acepta todos los tonos válidos', () => {
    const tonos = ['profesional', 'cercano', 'directo', 'formal'] as const
    for (const tono of tonos) {
      const result = profileSchema.safeParse({ ...perfil_valido, communication_tone: tono })
      expect(result.success).toBe(true)
    }
  })

  it('rechaza un tono inválido', () => {
    const result = profileSchema.safeParse({ ...perfil_valido, communication_tone: 'agresivo' })
    expect(result.success).toBe(false)
  })

  it('acepta logo_url con URL válida', () => {
    const result = profileSchema.safeParse({
      ...perfil_valido,
      logo_url: 'https://ejemplo.com/logo.png',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza logo_url con URL inválida', () => {
    const result = profileSchema.safeParse({ ...perfil_valido, logo_url: 'no-es-una-url' })
    expect(result.success).toBe(false)
  })

  it('acepta logo_url vacío (opcional)', () => {
    const result = profileSchema.safeParse({ ...perfil_valido, logo_url: '' })
    expect(result.success).toBe(true)
  })

  it('toDbProfile convierte campos opcionales vacíos a null para la BD', () => {
    const result = profileSchema.safeParse({
      ...perfil_valido,
      service_promise: '',
      social_proof: '',
      ideal_client: '',
      business_name: '',
      logo_url: '',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      const db = toDbProfile(result.data)
      expect(db.service_promise).toBeNull()
      expect(db.social_proof).toBeNull()
      expect(db.business_name).toBeNull()
      expect(db.logo_url).toBeNull()
    }
  })
})
