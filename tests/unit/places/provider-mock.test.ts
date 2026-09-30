import { describe, it, expect, vi } from 'vitest'
import type { PlacesProvider, PlaceResult, SearchParams } from '@/lib/places/types'

const mockResult: PlaceResult = {
  placeId: 'mock_001',
  provider: 'google',
  name: 'Mock Negocio',
  address: 'Calle Falsa 123, Madrid',
  lat: 40.416,
  lng: -3.703,
  websiteUrl: 'https://ejemplo.com',
  googleRating: 4.2,
  googleReviewsCount: 87,
}

function createMockProvider(): PlacesProvider {
  return {
    getName: () => 'google',
    search: vi.fn().mockResolvedValue([mockResult]),
    getDetails: vi.fn().mockResolvedValue(mockResult),
  }
}

describe('PlacesProvider — interfaz y mock', () => {
  it('el mock cumple la interfaz PlacesProvider', async () => {
    const provider = createMockProvider()
    expect(provider.getName()).toBe('google')

    const results = await provider.search({ query: 'restaurante', location: 'Madrid' })
    expect(results).toHaveLength(1)
    expect(results[0].placeId).toBe('mock_001')
  })

  it('search recibe los parámetros correctos', async () => {
    const provider = createMockProvider()
    const params: SearchParams = { query: 'dentista', location: 'Valencia', maxResults: 5 }

    await provider.search(params)

    expect(provider.search).toHaveBeenCalledWith(params)
  })

  it('getDetails recibe el placeId correcto', async () => {
    const provider = createMockProvider()
    const details = await provider.getDetails('mock_001')

    expect(provider.getDetails).toHaveBeenCalledWith('mock_001')
    expect(details.name).toBe('Mock Negocio')
  })

  it('el resultado incluye los campos requeridos por PlaceResult', async () => {
    const provider = createMockProvider()
    const [result] = await provider.search({ query: 'test', location: 'test' })

    expect(result).toHaveProperty('placeId')
    expect(result).toHaveProperty('provider')
    expect(result).toHaveProperty('name')
    expect(result).toHaveProperty('address')
    expect(result).toHaveProperty('lat')
    expect(result).toHaveProperty('lng')
  })

  it('la factory getPlacesProvider lanza error si PLACES_PROVIDER es desconocido', async () => {
    const originalEnv = process.env.PLACES_PROVIDER
    process.env.PLACES_PROVIDER = 'unknown_provider'

    const { getPlacesProvider } = await import('@/lib/places/index')

    expect(() => getPlacesProvider()).toThrow('PlacesProvider desconocido: unknown_provider')

    process.env.PLACES_PROVIDER = originalEnv
  })
})
