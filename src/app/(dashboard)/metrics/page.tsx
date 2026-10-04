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

const FUNNEL_STAGES: { status: ProspectStatus; label: string; color: string }[] = [
  { status: 'nuevo', label: 'Nuevo', color: 'bg-blue-200' },
  { status: 'contactado', label: 'Contactado', color: 'bg-blue-400' },
  { status: 'respondio', label: 'Respondió', color: 'bg-indigo-400' },
  { status: 'reunion', label: 'Reunión', color: 'bg-violet-500' },
  { status: 'ganado', label: 'Ganado', color: 'bg-green-500' },
]

function FunnelBar({
  label,
  count,
  maxCount,
  colorClass,
}: {
  label: string
  count: number
  maxCount: number
  colorClass: string
}) {
  const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-xs text-right text-zinc-600 shrink-0">{label}</span>
      <div className="flex-1 h-6 bg-zinc-100 rounded-sm overflow-hidden">
        <div
          className={`h-full rounded-sm transition-all ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-16 text-xs tabular-nums text-zinc-500 shrink-0">
        {count} ({pct}%)
      </span>
    </div>
  )
}

function stageConversionRate(
  stageCounts: number[],
  fromIdx: number,
): string {
  // denominator: sum from fromIdx to end (ganado + perdido included via full tail)
  const denominator = stageCounts.slice(fromIdx).reduce((a, b) => a + b, 0)
  if (denominator === 0) return '—'
  const toCount = stageCounts[fromIdx + 1] ?? 0
  return `${Math.round((toCount / denominator) * 100)}%`
}

function conversionColor(value: string): string {
  if (value === '—') return 'text-zinc-400'
  const n = parseInt(value)
  if (n >= 40) return 'text-green-600 font-medium'
  if (n >= 20) return 'text-amber-600 font-medium'
  return 'text-red-600 font-medium'
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

  // Funnel metrics
  const total = allStatuses.reduce((sum, s) => sum + (statusCounts[s] ?? 0), 0)
  const totalActivos = total - (statusCounts.perdido ?? 0)
  const tasaCierre = total > 0
    ? Math.round(((statusCounts.ganado ?? 0) / total) * 100)
    : 0

  const funnelCounts = FUNNEL_STAGES.map((s) => statusCounts[s.status] ?? 0)
  const maxFunnelCount = Math.max(...funnelCounts, 1)

  // Stage-to-stage conversion rates (denominator includes perdido for the first two transitions)
  const allOrderedCounts = [
    statusCounts.nuevo ?? 0,
    statusCounts.contactado ?? 0,
    statusCounts.respondio ?? 0,
    statusCounts.reunion ?? 0,
    statusCounts.ganado ?? 0,
    statusCounts.perdido ?? 0,
  ]

  const STAGE_TRANSITIONS: { label: string; fromIdx: number }[] = [
    { label: 'Nuevo → Contactado', fromIdx: 0 },
    { label: 'Contactado → Respondió', fromIdx: 1 },
    { label: 'Respondió → Reunión', fromIdx: 2 },
    { label: 'Reunión → Ganado', fromIdx: 3 },
  ]

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

      {/* Funnel de ventas */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">Funnel de ventas</h2>

        {/* Resumen del pipeline */}
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

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-zinc-900 tabular-nums">{tasaCierre}%</p>
            <p className="text-xs text-zinc-500 mt-1">Tasa de cierre</p>
            <p className="text-xs text-zinc-400">(ganados / total)</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-zinc-900 tabular-nums">{totalActivos}</p>
            <p className="text-xs text-zinc-500 mt-1">Prospectos activos</p>
            <p className="text-xs text-zinc-400">(excluye perdidos)</p>
          </div>
        </div>

        {/* Barras del funnel */}
        <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-3">
          {FUNNEL_STAGES.map((stage, i) => (
            <FunnelBar
              key={stage.status}
              label={stage.label}
              count={funnelCounts[i]}
              maxCount={maxFunnelCount}
              colorClass={stage.color}
            />
          ))}
        </div>

        {/* Conversión entre etapas */}
        <div className="rounded-lg border border-zinc-200 bg-white divide-y divide-zinc-100">
          {STAGE_TRANSITIONS.map((t) => {
            const rate = stageConversionRate(allOrderedCounts, t.fromIdx)
            return (
              <div key={t.label} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-xs text-zinc-600">{t.label}</span>
                <span className={`text-xs tabular-nums ${conversionColor(rate)}`}>{rate}</span>
              </div>
            )
          })}
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
