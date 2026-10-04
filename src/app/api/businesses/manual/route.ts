import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { manualBusinessSchema, normalizeUrl } from '@/lib/validations/manual-business'
import { captureEvent } from '@/lib/analytics/posthog-server'

export async function POST(request: NextRequest) {
  // 1. Auth
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
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

  const parsed = manualBusinessSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { name, website, category, city, phone, address } = parsed.data
  const websiteNormalized = website ? normalizeUrl(website) : null

  // 4. place_id único para entradas manuales
  const placeId = `manual_${crypto.randomUUID()}`

  // 5. Insertar negocio
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .insert({
      user_id: user.id,
      place_id: placeId,
      name,
      website: websiteNormalized,
      category: category ?? null,
      city: city ?? null,
      phone: phone ?? null,
      address: address ?? null,
      lat: 0,
      lng: 0,
    })
    .select('id')
    .single()

  if (bizError || !business) {
    return NextResponse.json({ error: 'No se pudo guardar el negocio' }, { status: 500 })
  }

  // 6. Crear prospecto en estado 'nuevo'
  const { error: prospectError } = await supabase.from('prospects').insert({
    user_id: user.id,
    business_id: business.id,
    status: 'nuevo',
  })

  if (prospectError) {
    // Limpiar el negocio insertado si el prospecto falla
    await supabase.from('businesses').delete().eq('id', business.id)
    return NextResponse.json({ error: 'No se pudo crear el prospecto' }, { status: 500 })
  }

  void captureEvent(user.id, 'business_added_manually', { has_website: !!websiteNormalized })

  // 7. Devolver en formato compatible con SearchResult
  return NextResponse.json({
    result: {
      placeId,
      businessId: business.id,
      name,
      address: address ?? city ?? '',
      phone: phone ?? undefined,
      websiteUrl: websiteNormalized ?? undefined,
      lat: 0,
      lng: 0,
      alreadySaved: true,
    },
  })
}
