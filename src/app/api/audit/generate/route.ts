import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit } from '@/lib/rate-limit'
import { auditRequestSchema } from '@/lib/validations/audit'
import { getRecommendations } from '@/lib/audit/recommendations'
import { generateAuditPDF } from '@/lib/audit/generator'
import { PLAN_LIMITS } from '@/lib/stripe/config'
import type { SignalBreakdown } from '@/lib/scoring/scorer'

export async function POST(request: NextRequest) {
  // 1. Auth
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // 2. Rate limit
  const rl = checkRateLimit(user.id)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Demasiadas peticiones. Espera un momento.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  // 3. Validar body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = auditRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { businessId, scoreId } = parsed.data
  const admin = createAdminClient()

  // 4. Verificar que el negocio pertenece al usuario
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('id, name, address')
    .eq('id', businessId)
    .eq('user_id', user.id)
    .single()

  if (bizError || !business) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
  }

  // 5. Obtener el score
  const { data: score, error: scoreError } = await supabase
    .from('scores')
    .select('id, total_score, breakdown')
    .eq('id', scoreId)
    .eq('user_id', user.id)
    .single()

  if (scoreError || !score) {
    return NextResponse.json({ error: 'Puntuación no encontrada' }, { status: 404 })
  }

  // 6. Cuota mensual de auditorías
  const { data: subscription } = await admin
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .maybeSingle()

  const plan = subscription?.plan ?? 'free'
  const monthlyLimit = PLAN_LIMITS[plan].auditsPerMonth

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: usedAudits } = await admin
    .from('usage_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('action', 'audit')
    .gte('created_at', startOfMonth.toISOString())

  if ((usedAudits ?? 0) >= monthlyLimit) {
    return NextResponse.json(
      {
        error: 'Has alcanzado el límite de auditorías de tu plan.',
        used: usedAudits,
        limit: monthlyLimit,
        plan,
      },
      { status: 429 }
    )
  }

  // 7. Obtener nombre del freelancer
  const { data: profile } = await supabase
    .from('users_profile')
    .select('business_name')
    .eq('id', user.id)
    .single()

  const freelancerName = profile?.business_name ?? user.email ?? 'Freelancer'

  // 8. Generar PDF
  const breakdown = score.breakdown as unknown as SignalBreakdown[]
  const recommendations = getRecommendations(breakdown)
  const generatedAt = new Date().toISOString()

  const pdfBytes = await generateAuditPDF({
    businessName: business.name,
    address: business.address ?? '',
    totalScore: score.total_score,
    breakdown,
    recommendations,
    freelancerName,
    generatedAt,
  })

  // 9. Subir a Supabase Storage
  const auditId = crypto.randomUUID()
  const storagePath = `${user.id}/${businessId}/${auditId}.pdf`

  const { error: uploadError } = await admin.storage
    .from('audit-pdfs')
    .upload(storagePath, pdfBytes, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: 'Error al subir el PDF' }, { status: 500 })
  }

  // 10. Insertar en audits
  await admin.from('audits').insert({
    id: auditId,
    user_id: user.id,
    business_id: businessId,
    score_id: scoreId,
    pdf_url: storagePath,
    generated_at: generatedAt,
  })

  // 11. Registrar uso
  await admin.from('usage_logs').insert({
    user_id: user.id,
    action: 'audit',
    metadata: { business_id: businessId, score_id: scoreId, audit_id: auditId },
  })

  // 12. Generar URL firmada (1 hora)
  const { data: signedData } = await admin.storage
    .from('audit-pdfs')
    .createSignedUrl(storagePath, 3600)

  return NextResponse.json({
    auditId,
    pdfUrl: signedData?.signedUrl ?? null,
  })
}
