import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { proposalRequestSchema } from '@/lib/validations/proposal'
import { generateProposalPDF, breakdownToProblems } from '@/lib/proposal/generator'
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

  const parsed = proposalRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { businessId, scoreId, solutionTitle, solutionDescription, price, deliveryWeeks, includesHosting, includesSeo } = parsed.data

  // 4. Verificar negocio
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('id, name, address, phone, website')
    .eq('id', businessId)
    .eq('user_id', user.id)
    .single()

  if (bizError || !business) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
  }

  // 5. Obtener el score más reciente (o el especificado)
  let scoreData = null
  if (scoreId) {
    const { data } = await supabase
      .from('scores')
      .select('id, total_score, breakdown')
      .eq('id', scoreId)
      .eq('user_id', user.id)
      .single()
    scoreData = data
  } else {
    const { data } = await supabase
      .from('scores')
      .select('id, total_score, breakdown')
      .eq('business_id', businessId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
    scoreData = data?.[0] ?? null
  }
  const score = scoreData

  // 6. Obtener perfil del freelancer
  const { data: profile } = await supabase
    .from('users_profile')
    .select('business_name')
    .eq('id', user.id)
    .single()

  const freelancerName = profile?.business_name ?? user.email ?? 'Freelancer'

  // 7. Construir problemas desde breakdown (si hay score)
  const breakdown = score ? (score.breakdown as unknown as SignalBreakdown[]) : []
  const problems = breakdownToProblems(breakdown)

  // 8. Generar PDF
  const pdfBytes = await generateProposalPDF({
    businessName: business.name,
    businessAddress: business.address ?? '',
    businessPhone: business.phone ?? null,
    businessWebsite: business.website ?? null,
    totalScore: score?.total_score ?? 0,
    problems,
    solutionTitle,
    solutionDescription,
    price,
    deliveryWeeks,
    includesHosting,
    includesSeo,
    freelancerName,
    freelancerEmail: user.email ?? null,
    freelancerPhone: null,
    generatedAt: new Date().toISOString(),
  })

  // 9. Devolver PDF directamente
  const filename = `propuesta-${business.name.replace(/\s+/g, '-').toLowerCase()}.pdf`
  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
