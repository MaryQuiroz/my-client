import { createAdminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/badge'
import type { PlanId } from '@/lib/stripe/config'

const PLAN_LABELS: Record<PlanId, string> = {
  free: 'Gratuito',
  pro: 'Pro',
  agency: 'Agencia',
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  canceled: 'bg-zinc-50 text-zinc-500 border-zinc-200',
  past_due: 'bg-red-50 text-red-700 border-red-200',
  trialing: 'bg-blue-50 text-blue-700 border-blue-200',
}

export default async function AdminUsersPage() {
  const admin = createAdminClient()

  const [authResult, subsResult] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 200 }),
    admin.from('subscriptions').select('user_id, plan, status, current_period_end, created_at'),
  ])

  const authUsers = authResult.data?.users ?? []
  const subs = subsResult.data ?? []

  const subsByUserId = new Map(subs.map((s) => [s.user_id, s]))

  const rows = authUsers
    .map((u) => ({
      id: u.id,
      email: u.email ?? '—',
      createdAt: u.created_at,
      sub: subsByUserId.get(u.id) ?? null,
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Usuarios</h1>
        <p className="mt-1 text-sm text-zinc-500">{rows.length} usuarios registrados</p>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="px-4 py-3 text-left font-medium text-zinc-500">Email</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500">Plan</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500">Estado</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500">Renovación</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500">Alta</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const plan = (row.sub?.plan ?? 'free') as PlanId
              const status = row.sub?.status ?? 'active'
              const periodEnd = row.sub?.current_period_end

              return (
                <tr key={row.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 text-zinc-800 max-w-xs truncate">{row.email}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={plan === 'free' ? 'secondary' : 'default'}
                      className="text-xs"
                    >
                      {PLAN_LABELS[plan]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[status] ?? STATUS_STYLES.active
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {periodEnd
                      ? new Date(periodEnd).toLocaleDateString('es-ES')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(row.createdAt).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-400">
                  Sin usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
