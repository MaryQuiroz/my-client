import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit } from '@/lib/rate-limit'
import { scoringRequestSchema } from '@/lib/validations/scoring'
import { scoreBusiness } from '@/lib/scoring/scorer'
import { fetchPageSpeed } from '@/lib/scoring/pagespeed'

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

  const parsed = scoringRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { businessId, googleRating, googleReviewsCount } = parsed.data

  // 4. Obtener el negocio (verificar que pertenece al usuario)
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('id, website, phone')
    .eq('id', businessId)
    .eq('user_id', user.id)
    .single()

  if (bizError || !business) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
  }

  // 5. Pesos personalizados del usuario
  const { data: userWeights } = await supabase
    .from('signal_weights')
    .select('*')
    .eq('user_id', user.id)

  // 6. PageSpeed si el negocio tiene web
  let pagespeedData = null
  let pagespeedCalled = false

  if (business.website) {
    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY
    if (apiKey) {
      pagespeedCalled = true
      pagespeedData = await fetchPageSpeed(business.website, apiKey)
    }
  }

  // 7. Calcular puntuación
  const { totalScore, breakdown } = scoreBusiness(
    {
      website: business.website,
      phone: business.phone,
      googleRating: googleRating ?? null,
      googleReviewsCount: googleReviewsCount ?? null,
      pagespeedData,
    },
    userWeights ?? []
  )

  // 8. Guardar en scores
  const admin = createAdminClient()

  const { data: scoreRow, error: scoreError } = await admin
    .from('scores')
    .insert({
      business_id: businessId,
      user_id: user.id,
      total_score: totalScore,
      breakdown: breakdown as unknown as Parameters<typeof admin.from>[0],
      pagespeed_data: pagespeedData as unknown as Parameters<typeof admin.from>[0],
      measured_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (scoreError) {
    return NextResponse.json({ error: 'Error al guardar puntuación' }, { status: 500 })
  }

  // 9. Registrar uso de PageSpeed
  if (pagespeedCalled) {
    await admin.from('usage_logs').insert({
      user_id: user.id,
      action: 'pagespeed',
      metadata: { business_id: businessId, url: business.website },
    })
  }

  return NextResponse.json({ score: { ...scoreRow, breakdown } })
}
