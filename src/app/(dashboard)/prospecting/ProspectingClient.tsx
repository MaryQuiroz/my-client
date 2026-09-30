'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import SearchForm, { type SearchResult, type QuotaInfo } from '@/components/prospecting/SearchForm'
import BusinessCard from '@/components/prospecting/BusinessCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { QuotaResult } from '@/lib/quota'
import type { PlanId } from '@/lib/stripe/config'

// Leaflet requiere window → importación dinámica con SSR desactivado
const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] w-full rounded-lg border bg-zinc-50 flex items-center justify-center text-zinc-400">
      Cargando mapa…
    </div>
  ),
})

type Tab = 'lista' | 'mapa'

interface ProspectingClientProps {
  initialSearchQuota: QuotaResult
}

export default function ProspectingClient({ initialSearchQuota }: ProspectingClientProps) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [searchQuota, setSearchQuota] = useState<QuotaResult>(initialSearchQuota)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<Tab>('lista')
  const [hasSearched, setHasSearched] = useState(false)

  function handleResults(data: SearchResult[], q: QuotaInfo) {
    setResults(data)
    setSearchQuota({
      allowed: q.used < q.limit,
      used: q.used,
      limit: q.limit,
      plan: q.plan as PlanId,
    })
    setHasSearched(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-zinc-900">Prospección manual</h1>
      </div>

      <SearchForm onResults={handleResults} onLoading={setLoading} searchQuota={searchQuota} />

      {loading && (
        <p className="text-sm text-zinc-500 animate-pulse">Buscando negocios…</p>
      )}

      {searchQuota.allowed && (
        <p className="text-xs text-zinc-400">
          Búsquedas este mes: {searchQuota.used} / {searchQuota.limit} (plan {searchQuota.plan})
        </p>
      )}

      {hasSearched && !loading && (
        <>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-600">
              {results.length} resultado{results.length !== 1 ? 's' : ''}
            </span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={tab === 'lista' ? 'default' : 'outline'}
                onClick={() => setTab('lista')}
              >
                Lista
              </Button>
              <Button
                size="sm"
                variant={tab === 'mapa' ? 'default' : 'outline'}
                onClick={() => setTab('mapa')}
                disabled={results.length === 0}
              >
                Mapa
              </Button>
            </div>
            {results.filter((r) => !r.websiteUrl).length > 0 && (
              <Badge variant="destructive">
                {results.filter((r) => !r.websiteUrl).length} sin web
              </Badge>
            )}
          </div>

          {results.length === 0 && (
            <p className="text-sm text-zinc-500">
              No se encontraron resultados. Prueba con otro tipo de negocio o zona.
            </p>
          )}

          {tab === 'lista' && results.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((business) => (
                <BusinessCard key={business.placeId} business={business} />
              ))}
            </div>
          )}

          {tab === 'mapa' && results.length > 0 && (
            <LeafletMap results={results} />
          )}
        </>
      )}
    </div>
  )
}
