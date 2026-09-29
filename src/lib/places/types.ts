// Interfaz PlacesProvider — implementar en Fase 3
// La lógica de negocio NUNCA importa un proveedor concreto; siempre usa esta interfaz.

export type ProviderName = 'google' | 'osm' | 'foursquare'

export interface PlaceResult {
  placeId: string
  provider: ProviderName
  name: string
  address: string
  lat: number
  lng: number
  websiteUrl?: string
  phone?: string
  googleRating?: number
  googleReviewsCount?: number
  // TODO-LEGAL: verificar qué campos de Google Places se pueden persistir según TOS vigente
}

export interface SearchParams {
  query: string // tipo de negocio (libre, nunca hardcodeado)
  location: string // zona (libre)
  radius?: number // metros
  maxResults?: number
}

export interface PlacesProvider {
  search(params: SearchParams): Promise<PlaceResult[]>
  getDetails(placeId: string): Promise<PlaceResult>
  getName(): ProviderName
}
