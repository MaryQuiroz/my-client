import { describe, it, expect } from 'vitest'
import { scoreBusiness, type ScoreInput, type PageSpeedData } from '@/lib/scoring/scorer'
import type { SignalWeight } from '@/types/database'

const allProblems: ScoreInput = {
  website: null,
  phone: null,
  googleRating: 3.5,
  googleReviewsCount: 5,
  pagespeedData: { performanceScore: 30, mobileFriendly: false },
}

const noProblems: ScoreInput = {
  website: 'https://ejemplo.com',
  phone: '+34 600 000 000',
  googleRating: 4.8,
  googleReviewsCount: 200,
  pagespeedData: { performanceScore: 90, mobileFriendly: true },
}

describe('scoreBusiness — función pura', () => {
  it('todos los problemas detectables con pesos default → totalScore = 80', () => {
    // no_https (15pts) no puede disparar cuando website=null → máximo real = 80
    // no_website(25) + slow_mobile(20) + not_mobile_friendly(15) + no_booking_or_whatsapp(10) + low_rating(10) = 80
    const { totalScore } = scoreBusiness(allProblems)
    expect(totalScore).toBe(80)
  })

  it('ningún problema detectado → totalScore = 0', () => {
    const { totalScore } = scoreBusiness(noProblems)
    expect(totalScore).toBe(0)
  })

  it('solo no_website disparado → 25 pts', () => {
    const input: ScoreInput = {
      website: null,
      phone: '+34 600 000 000', // tiene teléfono → no_booking_or_whatsapp no dispara
      googleRating: 4.5,
      googleReviewsCount: 100,
      pagespeedData: { performanceScore: 80, mobileFriendly: true },
    }
    const { totalScore, breakdown } = scoreBusiness(input)
    const noWebSignal = breakdown.find((b) => b.signal === 'no_website')
    expect(noWebSignal?.fired).toBe(true)
    expect(noWebSignal?.points).toBe(25)
    expect(totalScore).toBe(25)
  })

  it('web con HTTPS → no_https no dispara', () => {
    const input: ScoreInput = { ...noProblems, website: 'https://ejemplo.com' }
    const { breakdown } = scoreBusiness(input)
    const httpsSignal = breakdown.find((b) => b.signal === 'no_https')
    expect(httpsSignal?.fired).toBe(false)
    expect(httpsSignal?.points).toBe(0)
  })

  it('web sin HTTPS → no_https dispara', () => {
    const input: ScoreInput = { ...noProblems, website: 'http://ejemplo.com' }
    const { breakdown } = scoreBusiness(input)
    const httpsSignal = breakdown.find((b) => b.signal === 'no_https')
    expect(httpsSignal?.fired).toBe(true)
    expect(httpsSignal?.points).toBe(15)
  })

  it('sin pagespeedData → slow_mobile y not_mobile_friendly ausentes del breakdown', () => {
    const input: ScoreInput = { ...allProblems, pagespeedData: null }
    const { breakdown } = scoreBusiness(input)
    const signals = breakdown.map((b) => b.signal)
    expect(signals).not.toContain('slow_mobile')
    expect(signals).not.toContain('not_mobile_friendly')
  })

  it('peso de usuario 0 → señal aporta 0 pts aunque dispare', () => {
    const userWeights: SignalWeight[] = [
      {
        id: 'w1',
        user_id: 'u1',
        signal_key: 'no_website',
        weight: 0,
        created_at: '',
        updated_at: '',
      },
    ]
    const { breakdown } = scoreBusiness({ ...allProblems }, userWeights)
    const noWebSignal = breakdown.find((b) => b.signal === 'no_website')
    expect(noWebSignal?.fired).toBe(true)
    expect(noWebSignal?.points).toBe(0)
  })

  it('peso doble → señal aporta el doble (total clamped a 100)', () => {
    const userWeights: SignalWeight[] = [
      {
        id: 'w1',
        user_id: 'u1',
        signal_key: 'no_website',
        weight: 2.0, // double the default 1.0
        created_at: '',
        updated_at: '',
      },
    ]
    const input: ScoreInput = {
      website: null,
      phone: '+34 600',
      googleRating: 4.5,
      googleReviewsCount: 100,
      pagespeedData: { performanceScore: 80, mobileFriendly: true },
    }
    const { breakdown, totalScore } = scoreBusiness(input, userWeights)
    const noWebSignal = breakdown.find((b) => b.signal === 'no_website')
    expect(noWebSignal?.points).toBe(50) // 25 * (2.0 / 1.0)
    expect(totalScore).toBeLessThanOrEqual(100)
  })

  it('unanswered_reviews siempre source unavailable y fired: false', () => {
    const { breakdown } = scoreBusiness(allProblems)
    const signal = breakdown.find((b) => b.signal === 'unanswered_reviews')
    expect(signal).toBeDefined()
    expect(signal?.source).toBe('unavailable')
    expect(signal?.fired).toBe(false)
    expect(signal?.points).toBe(0)
  })

  it('suma de breakdown[].points === totalScore', () => {
    const { totalScore, breakdown } = scoreBusiness(allProblems)
    const sum = breakdown.reduce((acc, b) => acc + b.points, 0)
    expect(sum).toBe(totalScore)
  })

  it('measuredAt es una fecha ISO válida', () => {
    const { breakdown } = scoreBusiness(allProblems)
    for (const item of breakdown) {
      expect(() => new Date(item.measuredAt)).not.toThrow()
      expect(new Date(item.measuredAt).toISOString()).toBe(item.measuredAt)
    }
  })

  it('low_rating dispara con nota < 4.0', () => {
    const input: ScoreInput = { ...noProblems, googleRating: 3.9 }
    const { breakdown } = scoreBusiness(input)
    const signal = breakdown.find((b) => b.signal === 'low_rating')
    expect(signal?.fired).toBe(true)
  })

  it('low_rating dispara con menos de 10 reseñas', () => {
    const input: ScoreInput = { ...noProblems, googleRating: 4.5, googleReviewsCount: 5 }
    const { breakdown } = scoreBusiness(input)
    const signal = breakdown.find((b) => b.signal === 'low_rating')
    expect(signal?.fired).toBe(true)
  })
})
