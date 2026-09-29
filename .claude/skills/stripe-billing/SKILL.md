---
name: stripe-billing
description: Usar cuando se implementan o modifican suscripciones de Stripe, webhooks, límites de plan o lógica de cuotas. Cubre el patrón de webhooks idempotentes y cómo testear billing.
---

# Skill: Stripe Billing

## Configuración de planes
`src/lib/stripe/config.ts` — único archivo con límites por plan (`free`, `pro`, `agency`).
Cambiar límites aquí se propaga a toda la lógica de cuotas.

## Patrón de webhook idempotente
```typescript
// src/lib/stripe/webhooks.ts
export async function handleStripeWebhook(req: Request) {
  const sig = req.headers.get('stripe-signature')!
  const body = await req.text()

  // 1. Verificar firma (SIEMPRE primero)
  const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)

  // 2. Idempotencia: registrar evento antes de procesar
  const { error } = await supabaseAdmin
    .from('stripe_events')
    .insert({ id: event.id, processed_at: new Date().toISOString() })

  if (error?.code === '23505') return // ya procesado (duplicate key)

  // 3. Procesar según tipo
  switch (event.type) {
    case 'customer.subscription.updated': ...
    case 'customer.subscription.deleted': ...
    case 'checkout.session.completed': ...
  }
}
```

## Flujo de suscripción
1. Usuario hace clic en "Mejorar plan" → `/api/stripe/checkout` crea Checkout Session
2. Stripe redirige a éxito → webhook `checkout.session.completed` actualiza `subscriptions`
3. Renovaciones y cancelaciones vía webhooks `customer.subscription.*`
4. Portal de cliente: `/api/stripe/portal` crea Customer Portal Session

## Comprobación de límites
```typescript
// En cada Route Handler que consuma una acción limitada:
const { canProceed, remaining } = await checkQuota(userId, 'search')
if (!canProceed) return Response.json({ error: 'quota_exceeded', remaining }, { status: 429 })
```

## Cómo testear
```typescript
// tests/unit/stripe/webhooks.test.ts
it('ignora un evento ya procesado (idempotencia)', () => { ... })
it('actualiza el plan al recibir subscription.updated', () => { ... })
it('rechaza webhooks con firma inválida', () => { ... })

// tests/unit/stripe/quotas.test.ts
it('bloquea al superar el límite del plan free', () => { ... })
it('permite al plan pro hacer más búsquedas', () => { ... })
it('registra el consumo en usage_logs', () => { ... })
```

## Reglas de seguridad
- `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` solo en servidor. Nunca en cliente.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` es la única clave de Stripe que va al cliente.
- Verificar firma en CADA webhook antes de cualquier acción.
- No confiar en los datos del body sin verificar la firma primero.
