import { describe, it, expect } from 'vitest'
import { searchSchema } from '@/lib/validations/search'

describe('searchSchema', () => {
  it('valida parámetros correctos', () => {
    const result = searchSchema.safeParse({ query: 'peluquería', location: 'Barcelona' })
    expect(result.success).toBe(true)
  })

  it('rechaza query vacía', () => {
    const result = searchSchema.safeParse({ query: '', location: 'Madrid' })
    expect(result.success).toBe(false)
  })

  it('rechaza location vacía', () => {
    const result = searchSchema.safeParse({ query: 'restaurante', location: '' })
    expect(result.success).toBe(false)
  })

  it('rechaza query demasiado larga (> 100 caracteres)', () => {
    const result = searchSchema.safeParse({
      query: 'a'.repeat(101),
      location: 'Madrid',
    })
    expect(result.success).toBe(false)
  })

  it('acepta radius dentro del rango válido', () => {
    const result = searchSchema.safeParse({
      query: 'fontanero',
      location: 'Sevilla',
      radius: 5000,
    })
    expect(result.success).toBe(true)
  })

  it('rechaza radius demasiado pequeño (< 100)', () => {
    const result = searchSchema.safeParse({
      query: 'fontanero',
      location: 'Sevilla',
      radius: 50,
    })
    expect(result.success).toBe(false)
  })

  it('rechaza radius demasiado grande (> 50000)', () => {
    const result = searchSchema.safeParse({
      query: 'fontanero',
      location: 'Sevilla',
      radius: 100000,
    })
    expect(result.success).toBe(false)
  })

  it('acepta maxResults dentro del rango válido', () => {
    const result = searchSchema.safeParse({
      query: 'dentista',
      location: 'Valencia',
      maxResults: 10,
    })
    expect(result.success).toBe(true)
  })

  it('rechaza maxResults mayor que 20', () => {
    const result = searchSchema.safeParse({
      query: 'dentista',
      location: 'Valencia',
      maxResults: 25,
    })
    expect(result.success).toBe(false)
  })

  it('radius y maxResults son opcionales', () => {
    const result = searchSchema.safeParse({ query: 'bar', location: 'Málaga' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.radius).toBeUndefined()
      expect(result.data.maxResults).toBeUndefined()
    }
  })
})
