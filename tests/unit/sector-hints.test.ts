import { describe, it, expect } from 'vitest'
import { getSectorHint } from '@/lib/messages/sector-hints'

describe('getSectorHint', () => {
  it('detecta restaurante por nombre de categoría', () => {
    const hint = getSectorHint('Restaurante')
    expect(hint).not.toBeNull()
    expect(hint?.keywords[0]).toBe('restaurante')
  })

  it('detecta clínica dental', () => {
    const hint = getSectorHint('Clínica Dental')
    expect(hint).not.toBeNull()
    expect(hint?.keywords).toContain('clinica')
  })

  it('detecta barbería', () => {
    const hint = getSectorHint('Barbería Premium')
    expect(hint).not.toBeNull()
    expect(hint?.keywords).toContain('barberia')
  })

  it('devuelve null para categoría null', () => {
    expect(getSectorHint(null)).toBeNull()
  })

  it('devuelve null para categoría undefined', () => {
    expect(getSectorHint(undefined)).toBeNull()
  })

  it('devuelve null para sector desconocido', () => {
    expect(getSectorHint('fontanería')).toBeNull()
  })

  it('detecta gym con acento en pádel', () => {
    const hint = getSectorHint('Club de Pádel')
    expect(hint).not.toBeNull()
    expect(hint?.valueProps).toContain('captar nuevos socios con Google')
  })

  it('detecta hotel', () => {
    const hint = getSectorHint('Hotel Rural')
    expect(hint).not.toBeNull()
    expect(hint?.painPoints).toContain('dependen de Booking/Airbnb (comisiones altas)')
  })

  it('detecta tienda por categoria ropa', () => {
    const hint = getSectorHint('Tienda de Ropa')
    expect(hint).not.toBeNull()
    expect(hint?.valueProps).toContain('venta online')
  })
})
