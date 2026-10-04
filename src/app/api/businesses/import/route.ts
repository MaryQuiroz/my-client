import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { csvRowSchema } from '@/lib/validations/csv-import'
import { captureEvent } from '@/lib/analytics/posthog-server'

function normalizeUrl(value: string | undefined): string | null {
  if (!value) return null
  return value.startsWith('http') ? value : `https://${value}`
}

const importBodySchema = z.object({
  rows: z.array(csvRowSchema).min(1).max(200),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const rl = checkRateLimit(user.id)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Demasiadas peticiones. Espera un momento.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = importBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { rows } = parsed.data
  let imported = 0
  let skipped = 0

  for (const row of rows) {
    const placeId = `csv_${crypto.randomUUID()}`
    const websiteNormalized = normalizeUrl(row.website)

    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .insert({
        user_id: user.id,
        place_id: placeId,
        name: row.name,
        website: websiteNormalized,
        category: row.category ?? null,
        city: row.city ?? null,
        phone: row.phone ?? null,
        address: null,
        lat: 0,
        lng: 0,
      })
      .select('id')
      .single()

    if (bizError || !business) {
      skipped++
      continue
    }

    const { error: prospectError } = await supabase
      .from('prospects')
      .upsert(
        { user_id: user.id, business_id: business.id, status: 'nuevo' },
        { onConflict: 'user_id,business_id', ignoreDuplicates: true }
      )

    if (prospectError) {
      await supabase.from('businesses').delete().eq('id', business.id)
      skipped++
      continue
    }

    imported++
  }

  void captureEvent(user.id, 'businesses_imported_csv', { imported, skipped })

  return NextResponse.json({ imported, skipped })
}

