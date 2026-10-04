import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import dynamic from 'next/dynamic'
import type { ProspectStatus } from '@/types/database'
import type { ProspectPin } from '@/components/map/ProspectMap'

export const metadata: Metadata = { title: 'Mapa de prospectos — My Client' }

const ProspectMap = dynamic(() => import('@/components/map/ProspectMap'), { ssr: false })

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

const ALL_STATUSES: ProspectStatus[] = ['nuevo', 'contactado', 'respondio', 'reunion', 'ganado', 'perdido']

export default async function MapaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  type ProspectRow = {
    id: string
    status: string
    notes: string | null
    businesses: {
      id: string
      name: string
      address: string | null
      website: string | null
      lat: number
      lng: number
    }
  }

  const { data: rawProspects } = await supabase
    .from('prospects')
    .select(`
      id, status, notes,
      businesses!inner(id, name, address, website, lat, lng)
    `)
    .eq('user_id', user.id)

  const prospects = (rawProspects ?? []) as unknown as ProspectRow[]

  const pins: ProspectPin[] = prospects
    .filter((p) => p.businesses.lat !== 0 || p.businesses.lng !== 0)
    .map((p) => ({
      id: p.id,
      businessName: p.businesses.name,
      address: p.businesses.address,
      website: p.businesses.website,
      lat: p.businesses.lat,
      lng: p.businesses.lng,
      status: p.status as ProspectStatus,
      notes: p.notes,
    }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Mapa de prospectos</h1>
        <p className="text-sm text-zinc-500">{pins.length} prospectos con ubicación</p>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 text-xs">
        {ALL_STATUSES.map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-full border border-white shadow-sm"
              style={{ background: STATUS_COLORS[s] }}
            />
            {STATUS_LABELS[s]}
          </span>
        ))}
      </div>

      {pins.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-8 text-center">
          <p className="text-zinc-500 text-sm">No hay prospectos con ubicación geográfica aún.</p>
          <p className="text-zinc-400 text-xs mt-1">
            Los negocios añadidos por búsqueda de Google Places aparecen aquí automáticamente.
          </p>
        </div>
      ) : (
        <ProspectMap pins={pins} />
      )}
    </div>
  )
}
