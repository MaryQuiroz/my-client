import { describe, it, expect, beforeAll } from 'vitest'
import { processStripeEvent } from '@/lib/stripe/events'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type Stripe from 'stripe'

// Fijar price IDs antes de que se importe el módulo (priceIdToPlan los lee en tiempo de ejecución)
beforeAll(() => {
  process.env.STRIPE_PRICE_ID_PRO = 'price_test_pro'
  process.env.STRIPE_PRICE_ID_AGENCY = 'price_test_agency'
})

// --- Helpers de mocks ---

function makeAdminMock(opts: {
  insertError?: { code?: string; message?: string } | null
} = {}) {
  return {
    from: (table: string) => {
      if (table === 'stripe_events') {
        return {
          insert: () => Promise.resolve({ error: opts.insertError ?? null }),
        }
      }
      // subscriptions
      return {
        upsert: () => Promise.resolve({ error: null }),
        update: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      }
    },
  } as unknown as SupabaseClient<Database>
}

function makeEvent(
  type: string,
  object: Record<string, unknown>,
  id = 'evt_test_001'
): Stripe.Event {
  return {
    id,
    type,
    data: { object },
    object: 'event',
    api_version: null,
    created: 0,
    livemode: false,
    pending_webhooks: 0,
    request: null,
  } as unknown as Stripe.Event
}

// --- Tests ---

describe('processStripeEvent', () => {
  it('evento ya procesado → devuelve { skipped: true } sin volver a procesar', async () => {
    const admin = makeAdminMock({ insertError: { code: '23505', message: 'duplicate key' } })
    const event = makeEvent('checkout.session.completed', {})
    const result = await processStripeEvent(event, admin)
    expect(result).toEqual({ skipped: true })
  })

  it('checkout.session.completed → upserta la suscripción con el plan correcto', async () => {
    const admin = makeAdminMock()
    const event = makeEvent('checkout.session.completed', {
      mode: 'subscription',
      customer: 'cus_abc',
      subscription: 'sub_abc',
      metadata: { user_id: 'user_123', plan: 'pro' },
    })
    const result = await processStripeEvent(event, admin)
    expect(result).toEqual({ processed: true, action: 'subscription:created' })
  })

  it('checkout.session.completed sin metadata → ignorado', async () => {
    const admin = makeAdminMock()
    const event = makeEvent('checkout.session.completed', {
      mode: 'subscription',
      customer: 'cus_abc',
      subscription: 'sub_abc',
      metadata: {},
    })
    const result = await processStripeEvent(event, admin)
    expect(result).toEqual({ processed: true, action: 'ignored:no-metadata' })
  })

  it('customer.subscription.updated → actualiza plan y estado', async () => {
    const admin = makeAdminMock()
    const event = makeEvent('customer.subscription.updated', {
      id: 'sub_abc',
      status: 'active',
      cancel_at_period_end: false,
      items: {
        data: [{
          price: { id: 'price_test_pro' },
          current_period_start: 1700000000,
          current_period_end: 1702592000,
        }],
      },
    })
    const result = await processStripeEvent(event, admin)
    expect(result).toEqual({ processed: true, action: 'subscription:updated' })
  })

  it('customer.subscription.deleted → resetea a plan free', async () => {
    const admin = makeAdminMock()
    const event = makeEvent('customer.subscription.deleted', {
      id: 'sub_abc',
      status: 'canceled',
      cancel_at_period_end: false,
      current_period_start: 1700000000,
      current_period_end: 1702592000,
      items: { data: [] },
    })
    const result = await processStripeEvent(event, admin)
    expect(result).toEqual({ processed: true, action: 'subscription:canceled' })
  })

  it('evento desconocido → procesado e ignorado sin error', async () => {
    const admin = makeAdminMock()
    const event = makeEvent('invoice.paid', { id: 'in_abc' })
    const result = await processStripeEvent(event, admin)
    expect(result).toEqual({ processed: true, action: 'ignored' })
  })
})
