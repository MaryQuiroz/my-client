'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { ProspectStatus } from '@/types/database'

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export interface ProspectPin {
  id: string
  businessName: string
  address: string | null
  website: string | null
  lat: number
  lng: number
  status: ProspectStatus
  notes: string | null
}

interface ProspectMapProps {
  pins: ProspectPin[]
}

const STATUS_COLORS: Record<ProspectStatus, string> = {
  nuevo: '#3b82f6',
  contactado: '#eab308',
  respondio: '#f97316',
  reunion: '#8b5cf6',
  ganado: '#22c55e',
  perdido: '#ef4444',
}

const STATUS_LABELS: Record<ProspectStatus, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  respondio: 'Respondió',
  reunion: 'Reunión',
  ganado: 'Ganado',
  perdido: 'Perdido',
}

function createPin(status: ProspectStatus) {
  return L.divIcon({
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${STATUS_COLORS[status]};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

function getCenter(pins: ProspectPin[]): [number, number] {
  if (pins.length === 0) return [40.416, -3.703]
  const avgLat = pins.reduce((acc, p) => acc + p.lat, 0) / pins.length
  const avgLng = pins.reduce((acc, p) => acc + p.lng, 0) / pins.length
  return [avgLat, avgLng]
}

export default function ProspectMap({ pins }: ProspectMapProps) {
  const center = getCenter(pins)

  return (
    <MapContainer
      center={center}
      zoom={12}
      className="w-full rounded-lg border min-h-[400px]"
      style={{ height: 'calc(100vh - 200px)', minHeight: '400px', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pins.map((pin) => (
        <Marker key={pin.id} position={[pin.lat, pin.lng]} icon={createPin(pin.status)}>
          <Popup>
            <div style={{ fontSize: '12px', lineHeight: '1.5', minWidth: '150px' }}>
              <p style={{ fontWeight: 600, marginBottom: 2 }}>{pin.businessName}</p>
              {pin.address && <p style={{ color: '#71717a' }}>{pin.address}</p>}
              <p style={{ marginTop: 4 }}>
                Estado:{' '}
                <span style={{ color: STATUS_COLORS[pin.status], fontWeight: 500 }}>
                  {STATUS_LABELS[pin.status]}
                </span>
              </p>
              {pin.website && (
                <a
                  href={pin.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#3b82f6', fontSize: '11px' }}
                >
                  {pin.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              {pin.notes && (
                <p
                  style={{
                    color: '#52525b',
                    fontSize: '11px',
                    marginTop: 4,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {pin.notes}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
