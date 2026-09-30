// ATENCIÓN: Solo para uso en Route Handlers y Server Actions — nunca en componentes cliente.
import { getStripeClient } from './client'
import { getStripePriceIds } from './config'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function createCheckoutSession(params: {
  userId: string
  userEmail: string
  plan: 'pro' | 'agency'
  stripeCustomerId?: string | null
}): Promise<string> {
  const stripe = getStripeClient()
  const priceId = getStripePriceIds()[params.plan]

  if (!priceId) {
    throw new Error(`STRIPE_PRICE_ID_${params.plan.toUpperCase()} no configurada`)
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    ...(params.stripeCustomerId
      ? { customer: params.stripeCustomerId }
      : { customer_email: params.userEmail }),
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${APP_URL}/upgrade?success=true`,
    cancel_url: `${APP_URL}/upgrade`,
    metadata: { user_id: params.userId, plan: params.plan },
    subscription_data: {
      metadata: { user_id: params.userId, plan: params.plan },
    },
  })

  if (!session.url) throw new Error('Stripe no devolvió URL de checkout')
  return session.url
}

export async function createPortalSession(params: {
  stripeCustomerId: string
}): Promise<string> {
  const stripe = getStripeClient()

  const session = await stripe.billingPortal.sessions.create({
    customer: params.stripeCustomerId,
    return_url: `${APP_URL}/upgrade`,
  })

  return session.url
}
