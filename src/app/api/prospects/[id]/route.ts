import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const patchProspectSchema = z.object({
  status: z.enum(['nuevo', 'contactado', 'respondio', 'reunion', 'ganado', 'perdido']).optional(),
  notes: z.string().max(2000).nullable().optional(),
  next_contact_at: z.string().datetime().nullable().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = patchProspectSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 422 })
  }

  type ProspectUpdate = {
    updated_at: string
    status?: 'nuevo' | 'contactado' | 'respondio' | 'reunion' | 'ganado' | 'perdido'
    notes?: string | null
    next_contact_at?: string | null
  }
  const updates: ProspectUpdate = { updated_at: new Date().toISOString() }
  if (parsed.data.status !== undefined) updates.status = parsed.data.status
  if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes
  if (parsed.data.next_contact_at !== undefined) updates.next_contact_at = parsed.data.next_contact_at

  const { data: prospect, error } = await supabase
    .from('prospects')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id, status, notes, next_contact_at, updated_at')
    .single()

  if (error || !prospect) {
    return NextResponse.json({ error: 'Prospecto no encontrado' }, { status: 404 })
  }

  return NextResponse.json({ prospect })
}
