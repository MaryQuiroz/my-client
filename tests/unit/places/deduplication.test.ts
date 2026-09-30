import { describe, it, expect } from 'vitest'
import type { PlaceResult } from '@/lib/places/types'

// Lógica de deduplicación extraída de la route para testear de forma aislada
function markAlreadySaved(
  results: PlaceResult[],
  savedPlaceIds: Set<string>
): Array<PlaceResult & { alreadySaved: boolean }> {
  return results.map((r) => ({ ...r, alreadySaved: savedPlaceIds.has(r.placeId) }))
}

const mockResults: PlaceResult[] = [
  {
    placeId: 'place_001',
    provider: 'google',
    name: 'Peluquería Sol',
    address: 'Calle Mayor 1, Barcelona',
    lat: 41.385,
    lng: 2.173,
  },
  {
    placeId: 'place_002',
    provider: 'google',
    name: 'Peluquería Luna',
    address: 'Calle Luna 5, Barcelona',
    lat: 41.386,
    lng: 2.174,
  },
  {
    placeId: 'place_003',
    provider: 'google',
    name: 'Peluquería Estrella',
    address: 'Paseo Gracia 10, Barcelona',
    lat: 41.387,
    lng: 2.175,
  },
]

describe('deduplicación de negocios', () => {
  it('marca como alreadySaved los negocios ya guardados', () => {
    const saved = new Set(['place_001', 'place_003'])
    const result = markAlreadySaved(mockResults, saved)

    expect(result[0].alreadySaved).toBe(true)
    expect(result[1].alreadySaved).toBe(false)
    expect(result[2].alreadySaved).toBe(true)
  })

  it('no marca ninguno si no hay guardados', () => {
    const result = markAlreadySaved(mockResults, new Set())
    expect(result.every((r) => !r.alreadySaved)).toBe(true)
  })

  it('marca todos si todos están guardados', () => {
    const saved = new Set(['place_001', 'place_002', 'place_003'])
    const result = markAlreadySaved(mockResults, saved)
    expect(result.every((r) => r.alreadySaved)).toBe(true)
  })

  it('no altera los campos originales del resultado', () => {
    const saved = new Set(['place_001'])
    const result = markAlreadySaved(mockResults, saved)

    expect(result[0].placeId).toBe('place_001')
    expect(result[0].name).toBe('Peluquería Sol')
    expect(result[0].lat).toBe(41.385)
  })

  it('resultados sin place_id en el set no se marcan', () => {
    const saved = new Set(['place_999'])
    const result = markAlreadySaved(mockResults, saved)
    expect(result.every((r) => !r.alreadySaved)).toBe(true)
  })
})
