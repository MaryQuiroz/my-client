'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { PlanId } from '@/lib/stripe/config'

interface CheckoutButtonProps {
  plan: 'pro' | 'agency'
  currentPlan: PlanId
  hasStripeCustomer: boolean
}

export function CheckoutButton({ plan, currentPlan, hasStripeCustomer }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isCurrentPlan = plan === currentPlan
  const onPaidPlan = currentPlan !== 'free'

  async function handleClick() {
    setLoading(true)
    setError(null)

    try {
      const endpoint = onPaidPlan && hasStripeCustomer ? '/api/stripe/portal' : '/api/stripe/checkout'
      const body = endpoint === '/api/stripe/checkout' ? JSON.stringify({ plan }) : '{}'

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Error inesperado')
        setLoading(false)
        return
      }

      window.location.href = data.url as string
    } catch {
      setError('Error de conexión')
      setLoading(false)
    }
  }

  if (isCurrentPlan) {
    return (
      <span className="inline-flex items-center rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-400">
        Plan actual
      </span>
    )
  }

  return (
    <div className="space-y-1">
      <Button size="sm" onClick={handleClick} disabled={loading} className="w-full text-xs">
        {loading ? 'Redirigiendo…' : onPaidPlan ? 'Cambiar plan' : 'Contratar'}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

interface PortalButtonProps {
  label?: string
}

export function PortalButton({ label = 'Gestionar suscripción' }: PortalButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Error inesperado')
        setLoading(false)
        return
      }

      window.location.href = data.url as string
    } catch {
      setError('Error de conexión')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-1">
      <Button variant="outline" size="sm" onClick={handleClick} disabled={loading}>
        {loading ? 'Redirigiendo…' : label}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
