// TODO-LEGAL: Los datos de contacto de negocios (teléfono, email) solo pueden usarse
// para comunicaciones relacionadas con el servicio ofrecido. Revisar RGPD art. 6.1.f
// antes de usar estos datos en campañas de prospección masiva.

'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import ScoreBreakdown from './ScoreBreakdown'
import type { SearchResult } from './SearchForm'
import type { SignalBreakdown } from '@/lib/scoring/scorer'

interface BusinessCardProps {
  business: SearchResult
}

type ScoreState =
  | { status: 'idle' }
  | { status: 'calculating' }
  | { status: 'done'; totalScore: number; breakdown: SignalBreakdown[] }
  | { status: 'error'; message: string }

export default function BusinessCard({ business }: BusinessCardProps) {
  const [scoreState, setScoreState] = useState<ScoreState>({ status: 'idle' })

  const hasWebsite = !!business.websiteUrl
  const ratingText =
    business.googleRating != null
      ? `${business.googleRating.toFixed(1)} ★ (${business.googleReviewsCount ?? 0})`
      : null

  async function handleScore() {
    if (!business.businessId) return
    setScoreState({ status: 'calculating' })

    try {
      const res = await fetch('/api/scoring/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.businessId,
          googleRating: business.googleRating ?? null,
          googleReviewsCount: business.googleReviewsCount ?? null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setScoreState({ status: 'error', message: data.error ?? 'Error al calcular' })
        return
      }

      setScoreState({
        status: 'done',
        totalScore: data.score.total_score,
        breakdown: data.score.breakdown,
      })
    } catch {
      setScoreState({ status: 'error', message: 'Error de conexión' })
    }
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-zinc-900 truncate">{business.name}</h3>
            <p className="text-sm text-zinc-500 truncate">{business.address}</p>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            {business.alreadySaved && (
              <Badge variant="secondary">Ya guardado</Badge>
            )}
            {!hasWebsite && (
              <Badge variant="destructive">Sin web</Badge>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-600">
          {business.phone && <span>{business.phone}</span>}
          {ratingText && <span>{ratingText}</span>}
          {hasWebsite && (
            <a
              href={business.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline truncate max-w-[200px]"
            >
              {business.websiteUrl?.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>

        {scoreState.status === 'idle' && business.businessId && (
          <Button size="sm" variant="outline" onClick={handleScore} className="w-full mt-1">
            Calcular puntuación
          </Button>
        )}

        {scoreState.status === 'calculating' && (
          <p className="text-xs text-zinc-400 animate-pulse text-center py-1">
            Calculando…{hasWebsite ? ' (analizando PageSpeed)' : ''}
          </p>
        )}

        {scoreState.status === 'error' && (
          <div className="space-y-1">
            <p className="text-xs text-red-600">{scoreState.message}</p>
            <Button size="sm" variant="outline" onClick={handleScore} className="w-full">
              Reintentar
            </Button>
          </div>
        )}

        {scoreState.status === 'done' && (
          <ScoreBreakdown
            totalScore={scoreState.totalScore}
            breakdown={scoreState.breakdown}
          />
        )}

        <Button
          size="sm"
          variant="outline"
          disabled
          className="w-full"
          title="Disponible en Fase 7 — Pipeline"
        >
          Añadir al pipeline
        </Button>
      </CardContent>
    </Card>
  )
}
