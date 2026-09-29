// Factory de PlacesProvider — implementar en Fase 3
// Lee PLACES_PROVIDER del entorno y devuelve la implementación correspondiente.

import type { PlacesProvider } from './types'

export function getPlacesProvider(): PlacesProvider {
  // TODO (Fase 3): importar y devolver la implementación según process.env.PLACES_PROVIDER
  throw new Error('getPlacesProvider: no implementado todavía (Fase 3)')
}

export type { PlacesProvider, PlaceResult, SearchParams, ProviderName } from './types'
