// ATENCIÓN: Solo para uso en Route Handlers y Server Actions — nunca en componentes cliente.
import Stripe from 'stripe'

let _client: Stripe | null = null

export function getStripeClient(): Stripe {
  if (!_client) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY no configurada')
    _client = new Stripe(key)
  }
  return _client
}
