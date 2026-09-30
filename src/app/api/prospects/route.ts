import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const addProspectSchema = z.object({
  businessId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = addProspectSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 422 })
  }

  const { businessId } = parsed.data

  // Verificar que el negocio pertenece al usuario
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .eq('user_id', user.id)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
  }

  // Comprobar si ya existe
  const { data: existing } = await supabase
    .from('prospects')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('business_id', businessId)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ prospect: existing, created: false })
  }

  // Crear nuevo
  const { data: prospect, error } = await supabase
    .from('prospects')
    .insert({ user_id: user.id, business_id: businessId, status: 'nuevo' })
    .select('id, status')
    .single()

  if (error || !prospect) {
    return NextResponse.json({ error: 'Error al crear prospecto' }, { status: 500 })
  }

  return NextResponse.json({ prospect, created: true }, { status: 201 })
}
