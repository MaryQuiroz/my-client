import type { SupabaseClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'
import type { Database, Json, PlanStatus } from '@/types/database'
import { priceIdToPlan } from './config'

export type EventResult = { processed: true; action: string } | { skipped: true }

function toDbStatus(s: string): PlanStatus {
  if (s === 'active' || s === 'canceled' || s === 'past_due' || s === 'trialing') return s
  return 'active'
}

export async function processStripeEvent(
  event: Stripe.Event,
  adminClient: SupabaseClient<Database>
): Promise<EventResult> {
  // Idempotencia: si el evento ya fue procesado, saltarlo
  const { error: insertError } = await adminClient.from('stripe_events').insert({
    id: event.id,
    type: event.type,
    data: event.data as unknown as Json,
    processed_at: new Date().toISOString(),
  })

  if (insertError) {
    const code = (insertError as { code?: string }).code
    if (code === '23505') return { skipped: true }
    throw new Error(`Error guardando evento Stripe: ${insertError.message}`)
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') return { processed: true, action: 'ignored:not-subscription' }

      const userId = session.metadata?.user_id
      const plan = session.metadata?.plan as 'pro' | 'agency' | undefined
      const customerId = session.customer as string
      const subscriptionId = session.subscription as string

      if (!userId || !plan) return { processed: true, action: 'ignored:no-metadata' }

      await adminClient.from('subscriptions').upsert(
        {
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan,
          status: 'active',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      return { processed: true, action: 'subscription:created' }
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const item = sub.items?.data?.[0]
      const priceId = item?.price?.id ?? ''
      const plan = priceIdToPlan(priceId)

      await adminClient
        .from('subscriptions')
        .update({
          plan,
          status: toDbStatus(sub.status),
          current_period_start: item?.current_period_start
            ? new Date(item.current_period_start * 1000).toISOString()
            : null,
          current_period_end: item?.current_period_end
            ? new Date(item.current_period_end * 1000).toISOString()
            : null,
          cancel_at_period_end: sub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', sub.id)
      return { processed: true, action: 'subscription:updated' }
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription

      await adminClient
        .from('subscriptions')
        .update({
          plan: 'free',
          status: 'canceled',
          stripe_subscription_id: null,
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', sub.id)
      return { processed: true, action: 'subscription:canceled' }
    }

    default:
      return { processed: true, action: 'ignored' }
  }
}
