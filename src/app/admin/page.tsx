import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PlanId } from '@/lib/stripe/config'

const PLAN_LABELS: Record<PlanId, string> = {
  free: 'Gratuito',
  pro: 'Pro',
  agency: 'Agencia',
}

export default async function AdminPage() {
  const admin = createAdminClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const [subsResult, actionsTodayResult, actionsMonthResult] = await Promise.all([
    admin.from('subscriptions').select('id, user_id, plan, status, created_at'),
    admin
      .from('usage_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', today.toISOString()),
    admin
      .from('usage_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', thisMonthStart.toISOString()),
  ])

  const subs = subsResult.data ?? []
  const actionsToday = actionsTodayResult.count ?? 0
  const actionsMonth = actionsMonthResult.count ?? 0

  const totalUsers = subs.length
  const paidUsers = subs.filter((s) => s.plan !== 'free' && s.status === 'active').length

  const byPlan: Record<PlanId, number> = { free: 0, pro: 0, agency: 0 }
  for (const s of subs) {
    byPlan[s.plan as PlanId] = (byPlan[s.plan as PlanId] ?? 0) + 1
  }

  const recentUsers = [...subs]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-zinc-900">Resumen</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard title="Usuarios totales" value={totalUsers} />
        <StatCard title="Con plan de pago" value={paidUsers} />
        <StatCard title="Acciones hoy" value={actionsToday} />
        <StatCard title="Acciones este mes" value={actionsMonth} />
      </div>

      {/* Distribución por plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-zinc-700">
            Distribución por plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(['free', 'pro', 'agency'] as PlanId[]).map((plan) => {
              const count = byPlan[plan]
              const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0
              return (
                <div key={plan} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-sm text-zinc-600">
                    {PLAN_LABELS[plan]}
                  </span>
                  <div className="flex-1 bg-zinc-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-medium text-zinc-900 tabular-nums">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Últimas altas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-zinc-700">
            Últimas altas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="px-4 py-2 text-left font-medium text-zinc-500">ID usuario</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-500">Plan</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-500">Estado</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-500">Alta</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((s, i) => (
                <tr key={i} className="border-b border-zinc-50 hover:bg-zinc-50">
                  <td className="px-4 py-2 font-mono text-xs text-zinc-500">
                    {s.user_id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-2 capitalize">{PLAN_LABELS[s.plan as PlanId]}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        s.status === 'active'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-zinc-500">
                    {new Date(s.created_at).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              ))}
              {recentUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-zinc-400">
                    Sin registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <p className="text-xs text-zinc-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-zinc-900 tabular-nums">{value.toLocaleString('es-ES')}</p>
      </CardContent>
    </Card>
  )
}
