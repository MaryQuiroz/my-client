'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { SearchResult } from '@/components/prospecting/SearchForm'

// Fix Leaflet marker icons broken en Next.js (webpack reescribe las rutas)
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface LeafletMapProps {
  results: SearchResult[]
}

function getCenter(results: SearchResult[]): [number, number] {
  if (results.length === 0) return [40.416, -3.703] // Madrid por defecto
  const avgLat = results.reduce((acc, r) => acc + r.lat, 0) / results.length
  const avgLng = results.reduce((acc, r) => acc + r.lng, 0) / results.length
  return [avgLat, avgLng]
}

export default function LeafletMap({ results }: LeafletMapProps) {
  const center = getCenter(results)

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="h-[480px] w-full rounded-lg border"
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {results.map((business) => (
        <Marker key={business.placeId} position={[business.lat, business.lng]}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{business.name}</p>
              <p className="text-zinc-500">{business.address}</p>
              {!business.websiteUrl && (
                <p className="text-red-600 mt-1">Sin web propia</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
