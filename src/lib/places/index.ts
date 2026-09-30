import type { PlacesProvider } from './types'
import { GooglePlacesProvider } from './google'

export function getPlacesProvider(): PlacesProvider {
  const provider = process.env.PLACES_PROVIDER ?? 'google'

  if (provider === 'google') {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY
    if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY no está configurada')
    return new GooglePlacesProvider(apiKey)
  }

  throw new Error(`PlacesProvider desconocido: ${provider}`)
}

export type { PlacesProvider, PlaceResult, SearchParams, ProviderName } from './types'
