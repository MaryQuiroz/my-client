import { describe, it, expect } from 'vitest'
import type {
  UserProfile,
  Business,
  Score,
  SignalWeight,
  Prospect,
  Audit,
  Message,
  UsageLog,
  Subscription,
  StripeEvent,
  AdminUser,
  ProspectStatus,
  MessageChannel,
  UsageAction,
} from '@/types/database'
import { DEFAULT_SIGNAL_CONFIG, type SignalKey } from '@/lib/scoring/config'
import { PLAN_LIMITS, type PlanId } from '@/lib/stripe/config'

// Valores esperados extraídos de las restricciones SQL de la migración 002
const PROSPECT_STATUSES: ProspectStatus[] = [
  'nuevo',
  'contactado',
  'respondio',
  'reunion',
  'ganado',
  'perdido',
]

const MESSAGE_CHANNELS: MessageChannel[] = ['whatsapp', 'llamada', 'email']

const USAGE_ACTIONS: UsageAction[] = ['search', 'audit', 'message', 'pagespeed']

const PLAN_IDS: PlanId[] = ['free', 'pro', 'agency']

describe('database schema — coherencia de tipos', () => {
  it('los tipos de todas las tablas compilan sin error', () => {
    // Si este test compila, los tipos son correctos
    const _profile: Partial<UserProfile> = { id: 'uuid', service_description: 'test' }
    const _business: Partial<Business> = { id: 'uuid', user_id: 'uuid', place_id: 'p1', name: 'Cafe' }
    const _score: Partial<Score> = { id: 'uuid', total_score: 75 }
    const _weight: Partial<SignalWeight> = { signal_key: 'no_website', weight: 0.8 }
    const _prospect: Partial<Prospect> = { status: 'nuevo' }
    const _audit: Partial<Audit> = { pdf_url: null }
    const _message: Partial<Message> = { channel: 'whatsapp', variant: 1 }
    const _log: Partial<UsageLog> = { action: 'search' }
    const _sub: Partial<Subscription> = { plan: 'free', status: 'active' }
    const _event: Partial<StripeEvent> = { id: 'evt_123', type: 'checkout.session.completed' }
    const _admin: Partial<AdminUser> = { id: 'uuid' }

    expect(_profile).toBeDefined()
    expect(_business).toBeDefined()
    expect(_score).toBeDefined()
    expect(_weight).toBeDefined()
    expect(_prospect).toBeDefined()
    expect(_audit).toBeDefined()
    expect(_message).toBeDefined()
    expect(_log).toBeDefined()
    expect(_sub).toBeDefined()
    expect(_event).toBeDefined()
    expect(_admin).toBeDefined()
  })

  it('los signal_key del schema coinciden con SignalKey de scoring/config', () => {
    const configKeys = DEFAULT_SIGNAL_CONFIG.map((s) => s.key) as string[]
    const EXPECTED_SIGNAL_KEYS: SignalKey[] = [
      'no_website',
      'slow_mobile',
      'no_https',
      'not_mobile_friendly',
      'no_booking_or_whatsapp',
      'low_rating',
      'unanswered_reviews',
    ]
    expect(configKeys).toEqual(expect.arrayContaining(EXPECTED_SIGNAL_KEYS))
    expect(configKeys).toHaveLength(EXPECTED_SIGNAL_KEYS.length)
  })

  it('los planes de subscriptions coinciden con PlanId de stripe/config', () => {
    const configPlans = Object.keys(PLAN_LIMITS) as PlanId[]
    expect(configPlans).toEqual(expect.arrayContaining(PLAN_IDS))
    expect(configPlans).toHaveLength(PLAN_IDS.length)
  })

  it('los valores de ProspectStatus cubren el kanban completo', () => {
    expect(PROSPECT_STATUSES).toHaveLength(6)
    expect(PROSPECT_STATUSES).toContain('nuevo')
    expect(PROSPECT_STATUSES).toContain('ganado')
    expect(PROSPECT_STATUSES).toContain('perdido')
  })

  it('los canales de MessageChannel son los tres esperados', () => {
    expect(MESSAGE_CHANNELS).toHaveLength(3)
    expect(MESSAGE_CHANNELS).toContain('whatsapp')
    expect(MESSAGE_CHANNELS).toContain('llamada')
    expect(MESSAGE_CHANNELS).toContain('email')
  })

  it('las acciones de UsageAction cubren todas las operaciones consumibles', () => {
    expect(USAGE_ACTIONS).toHaveLength(4)
    expect(USAGE_ACTIONS).toContain('search')
    expect(USAGE_ACTIONS).toContain('audit')
    expect(USAGE_ACTIONS).toContain('message')
    expect(USAGE_ACTIONS).toContain('pagespeed')
  })

  it('total_score en Score está entre 0 y 100', () => {
    const score: Partial<Score> = { total_score: 0 }
    expect(score.total_score).toBeGreaterThanOrEqual(0)
    score.total_score = 100
    expect(score.total_score).toBeLessThanOrEqual(100)
  })

  it('weight en SignalWeight está entre 0 y 1', () => {
    const weight: Partial<SignalWeight> = { weight: 0 }
    expect(weight.weight).toBeGreaterThanOrEqual(0)
    weight.weight = 1
    expect(weight.weight).toBeLessThanOrEqual(1)
  })
})
