import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRecommendations } from '@/lib/audit/recommendations'
import { breakdownToProblems } from '@/lib/proposal/generator'
import type { SignalBreakdown } from '@/lib/scoring/scorer'

interface ShareTokenRow {
  audit_id: string
  business_id: string
  user_id: string
  expires_at: string
}

interface PageProps {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params
  const admin = createAdminClient()
  const { data } = await (admin.from as CallableFunction)('audit_share_tokens')
    .select('businesses(name)')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle() as { data: { businesses: { name: string } | null } | null }

  const name = data?.businesses?.name ?? 'Auditoría web'
  return { title: `Auditoría web — ${name}` }
}

export default async function SharedAuditPage({ params }: PageProps) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: shareToken } = await (admin.from as CallableFunction)('audit_share_tokens')
    .select('audit_id, business_id, user_id, expires_at')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle() as { data: ShareTokenRow | null }

  if (!shareToken) notFound()

  const [auditResult, businessResult, profileResult] = await Promise.all([
    admin
      .from('audits')
      .select('id, score_id, generated_at')
      .eq('id', shareToken.audit_id)
      .single(),
    admin
      .from('businesses')
      .select('name, address, website, phone')
      .eq('id', shareToken.business_id)
      .single(),
    admin
      .from('users_profile')
      .select('business_name, service_description')
      .eq('id', shareToken.user_id)
      .maybeSingle(),
  ])

  if (!auditResult.data || !businessResult.data) notFound()

  const audit = auditResult.data
  const business = businessResult.data
  const profile = profileResult.data

  const { data: score } = audit.score_id
    ? await admin
        .from('scores')
        .select('total_score, breakdown')
        .eq('id', audit.score_id)
        .maybeSingle()
    : { data: null }

  const breakdown = (score?.breakdown as unknown as SignalBreakdown[]) ?? []
  const recommendations = getRecommendations(breakdown)
  const clientProblems = breakdownToProblems(breakdown)

  const totalScore = score?.total_score ?? 0
  const opportunityLabel =
    totalScore >= 60 ? 'Alta oportunidad de mejora'
    : totalScore >= 30 ? 'Oportunidad de mejora media'
    : 'Oportunidad de mejora baja'

  const scoreColor =
    totalScore >= 60 ? '#dc2626' : totalScore >= 30 ? '#d97706' : '#16a34a'

  const generatedAt = new Date(audit.generated_at).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  const expiresAt = new Date(shareToken.expires_at).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  const freelancerName = profile?.business_name ?? 'Tu proveedor web'

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-zinc-900 text-white px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="text-sm font-medium">{freelancerName}</span>
          <span className="text-xs text-zinc-400">Auditoría web</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Negocio */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h1 className="text-2xl font-bold text-zinc-900">{business.name}</h1>
          {business.address && (
            <p className="text-zinc-500 text-sm mt-1">{business.address}</p>
          )}
          <p className="text-zinc-400 text-xs mt-2">Auditoría del {generatedAt}</p>
        </div>

        {/* Puntuación */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-4xl font-bold tabular-nums" style={{ color: scoreColor }}>
                {totalScore}
                <span className="text-xl text-zinc-400">/100</span>
              </p>
              <p className="text-xs text-zinc-500 mt-1">Índice de oportunidad</p>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-700">{opportunityLabel}</p>
              <p className="text-xs text-zinc-400 mt-1">
                Cuanto mayor el índice, más margen de mejora tiene la presencia web del negocio.
              </p>
            </div>
          </div>
        </div>

        {/* Problemas en lenguaje cliente */}
        {clientProblems.length > 0 && (
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-base font-semibold text-zinc-900 mb-4">Problemas detectados</h2>
            <ul className="space-y-2">
              {clientProblems.map((problem, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                  <span className="text-red-500 shrink-0 mt-0.5">•</span>
                  {problem}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recomendaciones */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-base font-semibold text-zinc-900 mb-4">Cómo solucionarlo</h2>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.signal}>
                  <p className="text-sm font-medium text-zinc-800">→ {rec.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-zinc-900 rounded-xl p-6 text-white">
          <h2 className="text-base font-semibold mb-2">¿Quieres mejorar tu presencia web?</h2>
          <p className="text-sm text-zinc-300 mb-4">
            Contacta con {freelancerName} para recibir una propuesta personalizada.
          </p>
          {profile?.service_description && (
            <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
              {profile.service_description}
            </p>
          )}
        </div>

        {/* Pie */}
        <p className="text-center text-xs text-zinc-400 pb-4">
          Informe generado el {generatedAt} · Válido hasta el {expiresAt} ·{' '}
          <span className="text-zinc-300">Generado con My Client</span>
        </p>
      </div>
    </div>
  )
}
