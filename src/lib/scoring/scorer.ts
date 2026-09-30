import { DEFAULT_SIGNAL_CONFIG, type SignalKey, type SignalConfig } from './config'
import type { SignalWeight } from '@/types/database'

export interface PageSpeedData {
  performanceScore: number // 0-100
  mobileFriendly: boolean
}

export interface ScoreInput {
  website?: string | null
  phone?: string | null
  googleRating?: number | null
  googleReviewsCount?: number | null
  pagespeedData?: PageSpeedData | null
}

export interface SignalBreakdown {
  signal: SignalKey
  label: string
  fired: boolean
  points: number
  maxPoints: number
  source: 'places' | 'pagespeed' | 'unavailable'
  measuredAt: string
}

export interface ScoreResult {
  totalScore: number
  breakdown: SignalBreakdown[]
}

function mergeWeight(
  signal: SignalConfig,
  userWeights: SignalWeight[]
): number {
  const override = userWeights.find((w) => w.signal_key === signal.key)
  return override != null ? Number(override.weight) : signal.defaultWeight
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function scoreBusiness(
  input: ScoreInput,
  userWeights: SignalWeight[] = [],
  config: SignalConfig[] = DEFAULT_SIGNAL_CONFIG
): ScoreResult {
  const now = new Date().toISOString()
  const breakdown: SignalBreakdown[] = []
  let total = 0

  for (const signal of config) {
    const userWeight = mergeWeight(signal, userWeights)
    const weightedMax = signal.maxScore * (userWeight / signal.defaultWeight)

    // Señal con fuente no disponible
    if (signal.key === 'unanswered_reviews') {
      breakdown.push({
        signal: signal.key,
        label: signal.label,
        fired: false,
        points: 0,
        maxPoints: Math.round(weightedMax),
        source: 'unavailable',
        measuredAt: now,
      })
      continue
    }

    // Señales que dependen de PageSpeed — omitir si no hay datos
    if (
      (signal.key === 'slow_mobile' || signal.key === 'not_mobile_friendly') &&
      input.pagespeedData == null
    ) {
      continue
    }

    let fired = false
    let source: SignalBreakdown['source'] = 'places'

    switch (signal.key) {
      case 'no_website':
        fired = !input.website
        break

      case 'no_https':
        fired = !!input.website && !input.website.startsWith('https://')
        break

      case 'no_booking_or_whatsapp':
        fired = !input.website && !input.phone
        break

      case 'low_rating':
        fired =
          (input.googleRating != null && input.googleRating < 4.0) ||
          (input.googleReviewsCount != null && input.googleReviewsCount < 10)
        break

      case 'slow_mobile':
        source = 'pagespeed'
        fired = (input.pagespeedData?.performanceScore ?? 100) < 50
        break

      case 'not_mobile_friendly':
        source = 'pagespeed'
        fired = !(input.pagespeedData?.mobileFriendly ?? true)
        break
    }

    const points = fired ? Math.round(weightedMax) : 0
    total += points

    breakdown.push({
      signal: signal.key,
      label: signal.label,
      fired,
      points,
      maxPoints: Math.round(weightedMax),
      source,
      measuredAt: now,
    })
  }

  return {
    totalScore: clamp(Math.round(total), 0, 100),
    breakdown,
  }
}
