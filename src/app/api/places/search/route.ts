import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlacesProvider } from '@/lib/places'
import { searchSchema } from '@/lib/validations/search'
import { checkRateLimit } from '@/lib/rate-limit'
import { checkQuota } from '@/lib/quota'
import { captureEvent } from '@/lib/analytics/posthog-server'
import type { PlaceResult } from '@/lib/places/types'
import type { BusinessInsert } from '@/types/database'

export async function POST(request: NextRequest) {
  // 1. Auth
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // 2. Rate limit (10 req / 60s por usuario)
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

  const parsed = searchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  // 4. Cuota mensual según plan
  const admin = createAdminClient()

  const quota = await checkQuota(user.id, 'search', admin)
  if (!quota.allowed) {
    return NextResponse.json(
      { error: 'Has alcanzado el límite de búsquedas de tu plan.', ...quota },
      { status: 429 }
    )
  }

  // 5. Llamar al proveedor
  let results: PlaceResult[]
  try {
    const provider = getPlacesProvider()
    results = await provider.search(parsed.data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: `Error en búsqueda: ${message}` }, { status: 502 })
  }

  // 6. Deduplicar: saber qué place_ids ya están guardados
  const placeIds = results.map((r) => r.placeId)

  const { data: existing } = await supabase
    .from('businesses')
    .select('id, place_id')
    .eq('user_id', user.id)
    .in('place_id', placeIds)

  const existingMap = new Map((existing ?? []).map((b) => [b.place_id, b.id]))

  // 7. Insertar negocios nuevos (ON CONFLICT → ignorar)
  const newBusinesses: BusinessInsert[] = results
    .filter((r) => !existingMap.has(r.placeId))
    .map((r) => ({
      user_id: user.id,
      place_id: r.placeId,
      name: r.name,
      address: r.address,
      phone: r.phone ?? null,
      website: r.websiteUrl ?? null,
      lat: r.lat,
      lng: r.lng,
      // TODO-LEGAL: raw_data no persiste a largo plazo según TOS de Google Places
    }))

  if (newBusinesses.length > 0) {
    const { data: inserted } = await supabase
      .from('businesses')
      .upsert(newBusinesses, { onConflict: 'user_id,place_id', ignoreDuplicates: true })
      .select('id, place_id')

    for (const b of inserted ?? []) {
      existingMap.set(b.place_id, b.id)
    }
  }

  // 8. Registrar uso (service role — sin RLS)
  await admin.from('usage_logs').insert({
    user_id: user.id,
    action: 'search',
    metadata: {
      query: parsed.data.query,
      location: parsed.data.location,
      results_count: results.length,
      provider: 'google',
    },
  })

  void captureEvent(user.id, 'search_performed', { results_count: results.length })

  // 9. Devolver resultados con businessId y flag alreadySaved
  const response = results.map((r) => ({
    ...r,
    businessId: existingMap.get(r.placeId) ?? null,
    alreadySaved: existingMap.has(r.placeId),
  }))

  return NextResponse.json({
    results: response,
    quota: { used: quota.used + 1, limit: quota.limit, plan: quota.plan },
  })
}
