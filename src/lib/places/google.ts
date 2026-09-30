// TODO-LEGAL: Verificar qué campos de Google Places API (New) se pueden
// persistir a largo plazo según los TOS vigentes de Google Maps Platform.
// Referencia: https://developers.google.com/maps/terms#section_3_5
// Por defecto: cachear máximo 30 días, no redistribuir, no usar para enriquecer otros datos.

import type { PlacesProvider, PlaceResult, SearchParams, ProviderName } from './types'

const PLACES_API_BASE = 'https://places.googleapis.com/v1'

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.websiteUri',
  'places.internationalPhoneNumber',
  'places.rating',
  'places.userRatingCount',
].join(',')

interface GooglePlace {
  id: string
  displayName?: { text: string }
  formattedAddress?: string
  location?: { latitude: number; longitude: number }
  websiteUri?: string
  internationalPhoneNumber?: string
  rating?: number
  userRatingCount?: number
}

function toPlaceResult(place: GooglePlace): PlaceResult {
  return {
    placeId: place.id,
    provider: 'google',
    name: place.displayName?.text ?? 'Sin nombre',
    address: place.formattedAddress ?? '',
    lat: place.location?.latitude ?? 0,
    lng: place.location?.longitude ?? 0,
    websiteUrl: place.websiteUri,
    phone: place.internationalPhoneNumber,
    googleRating: place.rating,
    googleReviewsCount: place.userRatingCount,
  }
}

export class GooglePlacesProvider implements PlacesProvider {
  constructor(private readonly apiKey: string) {}

  getName(): ProviderName {
    return 'google'
  }

  async search(params: SearchParams): Promise<PlaceResult[]> {
    const textQuery = `${params.query} en ${params.location}`

    const body: Record<string, unknown> = {
      textQuery,
      maxResultCount: params.maxResults ?? 20,
      languageCode: 'es',
    }

    if (params.radius) {
      body.locationBias = {
        circle: {
          radius: params.radius,
        },
      }
    }

    const response = await fetch(`${PLACES_API_BASE}/places:searchText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Google Places API error ${response.status}: ${error}`)
    }

    const data = (await response.json()) as { places?: GooglePlace[] }
    return (data.places ?? []).map(toPlaceResult)
  }

  async getDetails(placeId: string): Promise<PlaceResult> {
    const fieldMask = FIELD_MASK.replace(/^places\./gm, '').split(',').join(',')

    const response = await fetch(`${PLACES_API_BASE}/places/${placeId}`, {
      headers: {
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask': fieldMask,
      },
    })

    if (!response.ok) {
      throw new Error(`Google Places getDetails error ${response.status}`)
    }

    const place = (await response.json()) as GooglePlace
    return toPlaceResult(place)
  }
}
