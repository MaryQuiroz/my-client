// TODO-LEGAL: Los datos de contacto de negocios (teléfono, email) solo pueden usarse
// para comunicaciones relacionadas con el servicio ofrecido. Revisar RGPD art. 6.1.f
// antes de usar estos datos en campañas de prospección masiva.

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { SearchResult } from './SearchForm'

interface BusinessCardProps {
  business: SearchResult
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const hasWebsite = !!business.websiteUrl
  const ratingText =
    business.googleRating != null
      ? `${business.googleRating.toFixed(1)} ★ (${business.googleReviewsCount ?? 0})`
      : null

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

        <Button
          size="sm"
          variant="outline"
          disabled
          className="w-full mt-1"
          title="Disponible en Fase 7 — Pipeline"
        >
          Añadir al pipeline
        </Button>
      </CardContent>
    </Card>
  )
}
