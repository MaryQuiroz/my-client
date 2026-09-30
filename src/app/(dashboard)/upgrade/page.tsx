import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PLAN_LIMITS, type PlanId, type PlanLimits } from '@/lib/stripe/config'
import { Badge } from '@/components/ui/badge'

const PLAN_NAMES: Record<PlanId, string> = {
  free: 'Gratuito',
  pro: 'Pro',
  agency: 'Agencia',
}

// TODO-LEGAL: Precios finales y condiciones con abogado antes de activar pagos (Fase 10)
const PLAN_PRICES: Record<PlanId, string> = {
  free: '0 €/mes',
  pro: '—',
  agency: '—',
}

const FEATURES: { label: string; key: keyof PlanLimits }[] = [
  { label: 'Búsquedas/mes', key: 'searchesPerMonth' },
  { label: 'Auditorías PDF/mes', key: 'auditsPerMonth' },
  { label: 'Mensajes IA/mes', key: 'messagesPerMonth' },
  { label: 'Usuarios', key: 'usersPerAccount' },
]

const PLANS: PlanId[] = ['free', 'pro', 'agency']

export default async function UpgradePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: subscription } = await admin
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .maybeSingle()

  const currentPlan = (subscription?.plan ?? 'free') as PlanId

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Planes</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Plan actual:{' '}
          <span className="font-medium text-zinc-700">{PLAN_NAMES[currentPlan]}</span>
        </p>
      </div>

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
                  className={`px-4 py-3 text-center ${
                    currentPlan === plan ? 'bg-blue-50/40' : ''
                  }`}
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
                  className={`px-4 py-4 text-center ${
                    currentPlan === plan ? 'bg-blue-50/40' : ''
                  }`}
                >
                  {plan === 'free' ? (
                    currentPlan === 'free' ? (
                      <span className="text-xs text-zinc-400">Plan actual</span>
                    ) : null
                  ) : (
                    <span className="inline-flex items-center rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-400">
                      Próximamente
                    </span>
                  )}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-xs text-zinc-400">
        {/* TODO-LEGAL: Precios, condiciones de suscripción e IVA pendientes de revisión legal antes de Fase 10. */}
        Los planes de pago se activarán próximamente.
      </p>
    </div>
  )
}
