import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PLAN_LIMITS, type PlanId } from '@/lib/stripe/config'
import type { ProspectStatus } from '@/types/database'

const PROSPECT_LABELS: Record<ProspectStatus, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  respondio: 'Respondió',
  reunion: 'Reunión',
  ganado: 'Ganado',
  perdido: 'Perdido',
}

const PROSPECT_COLORS: Record<ProspectStatus, string> = {
  nuevo: 'bg-blue-100 text-blue-700',
  contactado: 'bg-yellow-100 text-yellow-700',
  respondio: 'bg-orange-100 text-orange-700',
  reunion: 'bg-violet-100 text-violet-700',
  ganado: 'bg-green-100 text-green-700',
  perdido: 'bg-red-100 text-red-700',
}

function barColor(pct: number): string {
  if (pct >= 100) return 'bg-red-500'
  if (pct >= 80) return 'bg-amber-400'
  return 'bg-blue-500'
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = limit > 0 ? Math.round((used / limit) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-700">{label}</span>
        <span className="tabular-nums text-zinc-500">
          {used} / {limit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-zinc-100">
        <div
          className={`h-2 rounded-full transition-all ${barColor(pct)}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center">
      <p className="text-2xl font-bold text-zinc-900 tabular-nums">{value}</p>
      <p className="text-xs text-zinc-500 mt-1">{label}</p>
    </div>
  )
}

export default async function MetricsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const monthStart = startOfMonth.toISOString()

  const [
    subscriptionResult,
    searchCount,
    auditCount,
    messageCount,
    prospectRows,
    bizCount,
    auditTotalCount,
    msgTotalCount,
    msgCopiedCount,
  ] = await Promise.all([
    admin.from('subscriptions').select('plan').eq('user_id', user.id).maybeSingle(),
    admin.from('usage_logs').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('action', 'search').gte('created_at', monthStart),
    admin.from('usage_logs').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('action', 'audit').gte('created_at', monthStart),
    admin.from('usage_logs').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('action', 'message').gte('created_at', monthStart),
    supabase.from('prospects').select('status').eq('user_id', user.id),
    supabase.from('businesses').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('audits').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('messages').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('messages').select('id', { count: 'exact', head: true }).eq('user_id', user.id).not('copied_at', 'is', null),
  ])

  const plan = (subscriptionResult.data?.plan ?? 'free') as PlanId
  const limits = PLAN_LIMITS[plan]

  const usedSearches = searchCount.count ?? 0
  const usedAudits = auditCount.count ?? 0
  const usedMessages = messageCount.count ?? 0

  // Contar prospectos por status
  const statusCounts: Partial<Record<ProspectStatus, number>> = {}
  for (const row of prospectRows.data ?? []) {
    const s = row.status as ProspectStatus
    statusCounts[s] = (statusCounts[s] ?? 0) + 1
  }
  const allStatuses: ProspectStatus[] = ['nuevo', 'contactado', 'respondio', 'reunion', 'ganado', 'perdido']

  const planLabels: Record<PlanId, string> = { free: 'Gratuito', pro: 'Pro', agency: 'Agencia' }
  const now = new Date()
  const monthName = now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Métricas</h1>
        <span className="text-sm text-zinc-500 capitalize">{monthName}</span>
      </div>

      {/* Cuota mensual */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">Cuota mensual</h2>
          <span className="text-xs text-zinc-400">Plan {planLabels[plan]}</span>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-4">
          <UsageBar label="Búsquedas" used={usedSearches} limit={limits.searchesPerMonth} />
          <UsageBar label="Auditorías PDF" used={usedAudits} limit={limits.auditsPerMonth} />
          <UsageBar label="Mensajes generados" used={usedMessages} limit={limits.messagesPerMonth} />
        </div>
      </section>

      {/* Pipeline funnel */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">Embudo del pipeline</h2>
        <div className="flex flex-wrap gap-2">
          {allStatuses.map((s) => (
            <div
              key={s}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${PROSPECT_COLORS[s]}`}
            >
              {PROSPECT_LABELS[s]}: <span className="tabular-nums">{statusCounts[s] ?? 0}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Totales */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">Actividad total</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Negocios guardados" value={bizCount.count ?? 0} />
          <StatCard label="Auditorías generadas" value={auditTotalCount.count ?? 0} />
          <StatCard label="Mensajes generados" value={msgTotalCount.count ?? 0} />
          <StatCard label="Mensajes enviados" value={msgCopiedCount.count ?? 0} />
        </div>
      </section>

      {/* Exportar CSV */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">Exportar datos</h2>
        <a
          href="/api/export/prospects"
          className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          Exportar prospectos CSV
        </a>
        <p className="text-xs text-zinc-400">
          Descarga todos tus prospectos con datos del negocio, estado y notas.
        </p>
      </section>
    </div>
  )
}
