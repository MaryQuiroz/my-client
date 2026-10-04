import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PLAN_LIMITS, type PlanId, type PlanLimits } from '@/lib/stripe/config'
import { Badge } from '@/components/ui/badge'
import { CheckoutButton, PortalButton } from '@/components/billing/CheckoutButton'

const PLAN_NAMES: Record<PlanId, string> = {
  free: 'Gratuito',
  pro: 'Pro',
  agency: 'Agencia',
}

// TODO-LEGAL: Confirmar precios, IVA y condiciones de suscripción con abogado antes de activar modo live
const PLAN_PRICES: Record<PlanId, string> = {
  free: '0 €/mes',
  pro: '29 €/mes',
  agency: '79 €/mes',
}

const FEATURES: { label: string; key: keyof PlanLimits }[] = [
  { label: 'Búsquedas/mes', key: 'searchesPerMonth' },
  { label: 'Auditorías PDF/mes', key: 'auditsPerMonth' },
  { label: 'Mensajes IA/mes', key: 'messagesPerMonth' },
  { label: 'Usuarios', key: 'usersPerAccount' },
]

const PLANS: PlanId[] = ['free', 'pro', 'agency']

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: subscription } = await admin
    .from('subscriptions')
    .select('plan, stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const currentPlan = (subscription?.plan ?? 'free') as PlanId
  const hasStripeCustomer = !!subscription?.stripe_customer_id

  const params = await searchParams

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Planes</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Plan actual:{' '}
          <span className="font-medium text-zinc-700">{PLAN_NAMES[currentPlan]}</span>
        </p>
      </div>

      {params.success === 'true' && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Suscripción activada correctamente. Las nuevas cuotas ya están disponibles.
        </div>
      )}

      {params.canceled === 'true' && (
        <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          Proceso cancelado. Tu plan no ha cambiado.
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className="px-4 py-4 text-left font-medium text-zinc-500 w-44" />
              {PLANS.map((plan) => (
                <th key={plan} className="px-4 py-4 text-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="font-semibold text-zinc-900">{PLAN_NAMES[plan]}</span>
                    {currentPlan === plan && (
                      <Badge variant="secondary" className="text-xs">
                        Actual
                      </Badge>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map(({ label, key }) => (
              <tr key={key} className="border-b border-zinc-50">
                <td className="px-4 py-3 text-zinc-600">{label}</td>
                {PLANS.map((plan) => (
                  <td
                    key={plan}
                    className={`px-4 py-3 text-center tabular-nums font-medium ${
                      currentPlan === plan ? 'text-blue-700 bg-blue-50/40' : 'text-zinc-900'
                    }`}
                  >
                    {PLAN_LIMITS[plan][key].toLocaleString('es-ES')}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-b border-zinc-50">
              <td className="px-4 py-3 text-zinc-600">Precio</td>
              {PLANS.map((plan) => (
                <td
                  key={plan}
                  className={`px-4 py-3 text-center ${currentPlan === plan ? 'bg-blue-50/40' : ''}`}
                >
                  <span className="font-medium text-zinc-700">{PLAN_PRICES[plan]}</span>
                </td>
              ))}
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className="px-4 py-4" />
              {PLANS.map((plan) => (
                <td
                  key={plan}
                  className={`px-4 py-4 text-center ${currentPlan === plan ? 'bg-blue-50/40' : ''}`}
                >
                  {plan === 'free' ? (
                    currentPlan === 'free' ? (
                      <span className="text-xs text-zinc-400">Plan actual</span>
                    ) : null
                  ) : (
                    <CheckoutButton
                      plan={plan}
                      currentPlan={currentPlan}
                      hasStripeCustomer={hasStripeCustomer}
                    />
                  )}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {currentPlan !== 'free' && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">
            Gestionar suscripción
          </h2>
          <p className="text-xs text-zinc-500">
            Cambia de plan, descarga facturas o cancela desde el portal de Stripe.
          </p>
          <PortalButton />
        </section>
      )}

      <p className="text-xs text-zinc-400">
        {/* TODO-LEGAL: Precios definitivos, IVA y TOS pendientes de revisión antes de activar modo live. */}
        Pagos gestionados de forma segura por Stripe.
      </p>
    </div>
  )
}
