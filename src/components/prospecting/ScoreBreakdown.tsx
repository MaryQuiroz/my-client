import { Badge } from '@/components/ui/badge'
import type { SignalBreakdown } from '@/lib/scoring/scorer'

interface ScoreBreakdownProps {
  totalScore: number
  breakdown: SignalBreakdown[]
}

function sourceLabel(source: SignalBreakdown['source']) {
  if (source === 'pagespeed') return 'PageSpeed'
  if (source === 'unavailable') return 'No disponible'
  return 'Places'
}

export default function ScoreBreakdown({ totalScore, breakdown }: ScoreBreakdownProps) {
  return (
    <div className="mt-3 space-y-2 border-t pt-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-700">Puntuación de oportunidad</span>
        <span
          className={`text-2xl font-bold ${
            totalScore >= 60
              ? 'text-red-600'
              : totalScore >= 30
                ? 'text-amber-500'
                : 'text-green-600'
          }`}
        >
          {totalScore}
          <span className="text-sm font-normal text-zinc-400">/100</span>
        </span>
      </div>

      <div className="space-y-1">
        {breakdown.map((item) => (
          <div key={item.signal} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className={`shrink-0 h-2 w-2 rounded-full ${
                  item.fired ? 'bg-red-500' : 'bg-green-400'
                }`}
              />
              <span className={`truncate ${item.source === 'unavailable' ? 'text-zinc-400' : 'text-zinc-700'}`}>
                {item.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {item.source === 'unavailable' ? (
                <Badge variant="secondary" className="text-xs py-0">N/D</Badge>
              ) : (
                <span className={item.fired ? 'font-semibold text-red-600' : 'text-zinc-400'}>
                  {item.points}/{item.maxPoints}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-400">
        Mayor puntuación = más problemas web detectados = mayor oportunidad de venta.
        Fuentes: {[...new Set(breakdown.map((b) => sourceLabel(b.source)))].join(', ')}.
      </p>
    </div>
  )
}
