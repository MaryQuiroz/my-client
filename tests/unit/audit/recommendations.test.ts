import { describe, it, expect } from 'vitest'
import { getRecommendations } from '@/lib/audit/recommendations'
import { DEFAULT_SIGNAL_CONFIG } from '@/lib/scoring/config'
import type { SignalBreakdown } from '@/lib/scoring/scorer'

function makeSignal(
  overrides: Partial<SignalBreakdown> & Pick<SignalBreakdown, 'signal'>
): SignalBreakdown {
  return {
    label: 'Test',
    fired: false,
    points: 0,
    maxPoints: 10,
    source: 'places',
    measuredAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('getRecommendations', () => {
  it('señal fired:true → aparece en recomendaciones', () => {
    const breakdown = [makeSignal({ signal: 'no_website', fired: true, points: 25 })]
    const recs = getRecommendations(breakdown)
    expect(recs).toHaveLength(1)
    expect(recs[0].signal).toBe('no_website')
    expect(recs[0].title).toBeTruthy()
    expect(recs[0].description).toBeTruthy()
  })

  it('señal fired:false → no aparece', () => {
    const breakdown = [makeSignal({ signal: 'no_https', fired: false })]
    const recs = getRecommendations(breakdown)
    expect(recs).toHaveLength(0)
  })

  it('señal source:unavailable y fired:true → no aparece', () => {
    const breakdown = [
      makeSignal({ signal: 'unanswered_reviews', fired: true, source: 'unavailable' }),
    ]
    const recs = getRecommendations(breakdown)
    expect(recs).toHaveLength(0)
  })

  it('array vacío → recomendaciones vacías', () => {
    expect(getRecommendations([])).toHaveLength(0)
  })

  it('todas las SignalKey tienen entrada en el mapa de recomendaciones', () => {
    for (const signal of DEFAULT_SIGNAL_CONFIG) {
      const breakdown = [makeSignal({ signal: signal.key, fired: true })]
      const recs = getRecommendations(breakdown)
      expect(recs[0].title, `falta título para ${signal.key}`).toBeTruthy()
      expect(recs[0].description, `falta descripción para ${signal.key}`).toBeTruthy()
    }
  })

  it('el orden de recomendaciones coincide con el orden del breakdown', () => {
    const breakdown = [
      makeSignal({ signal: 'low_rating', fired: true }),
      makeSignal({ signal: 'no_https', fired: true }),
      makeSignal({ signal: 'slow_mobile', fired: true }),
    ]
    const recs = getRecommendations(breakdown)
    expect(recs.map((r) => r.signal)).toEqual(['low_rating', 'no_https', 'slow_mobile'])
  })

  it('mezcla de fired true/false → solo los fired:true aparecen', () => {
    const breakdown = [
      makeSignal({ signal: 'no_website', fired: true }),
      makeSignal({ signal: 'no_https', fired: false }),
      makeSignal({ signal: 'low_rating', fired: true }),
    ]
    const recs = getRecommendations(breakdown)
    expect(recs).toHaveLength(2)
    expect(recs.map((r) => r.signal)).toEqual(['no_website', 'low_rating'])
  })
})
