import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { profileSchema, toDbProfile } from '@/lib/validations/profile'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('users_profile')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: 'Error al obtener el perfil' }, { status: 500 })
  }

  return NextResponse.json({ profile: data ?? null })
}

// Body esperado: ProfileFormData + onboarding_completed opcional
interface PutBody {
  onboarding_completed?: boolean
  [key: string]: unknown
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body: PutBody
  try {
    body = (await request.json()) as PutBody
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const dbData = toDbProfile(parsed.data)
  const completeOnboarding = body.onboarding_completed === true

  const { data: existing } = await supabase
    .from('users_profile')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!existing) {
    const { data, error } = await supabase
      .from('users_profile')
      .insert({
        id: user.id,
        service_description: String(dbData.service_description),
        service_promise: (dbData.service_promise as string | null) ?? null,
        social_proof: (dbData.social_proof as string | null) ?? null,
        ideal_client: (dbData.ideal_client as string | null) ?? null,
        communication_tone: String(dbData.communication_tone),
        business_name: (dbData.business_name as string | null) ?? null,
        logo_url: (dbData.logo_url as string | null) ?? null,
        onboarding_completed: completeOnboarding,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Error al guardar el perfil' }, { status: 500 })
    return NextResponse.json({ profile: data }, { status: 201 })
  }

  const updatePayload: Record<string, unknown> = { ...dbData }
  if (completeOnboarding) updatePayload.onboarding_completed = true

  const { data, error } = await supabase
    .from('users_profile')
    .update({
      service_description: String(updatePayload.service_description),
      service_promise: (updatePayload.service_promise as string | null) ?? null,
      social_proof: (updatePayload.social_proof as string | null) ?? null,
      ideal_client: (updatePayload.ideal_client as string | null) ?? null,
      communication_tone: String(updatePayload.communication_tone),
      business_name: (updatePayload.business_name as string | null) ?? null,
      logo_url: (updatePayload.logo_url as string | null) ?? null,
      ...(completeOnboarding ? { onboarding_completed: true } : {}),
    })
    .eq('id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Error al actualizar el perfil' }, { status: 500 })
  return NextResponse.json({ profile: data })
}
