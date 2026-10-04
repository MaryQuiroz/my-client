import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit } from '@/lib/rate-limit'

type TimelineEventType = 'created' | 'status_change' | 'audit' | 'message' | 'message_copied' | 'note'

interface TimelineEvent {
  id: string
  type: TimelineEventType
  label: string
  date: string
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
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

  const { id } = await params

  const { data: prospect, error: prospectError } = await supabase
    .from('prospects')
    .select('id, created_at, updated_at, status, notes, contacted_at, business_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (prospectError || !prospect) {
    return NextResponse.json({ error: 'Prospecto no encontrado' }, { status: 404 })
  }

  const admin = createAdminClient()
  const { data: logs } = await admin
    .from('usage_logs')
    .select('id, action, created_at')
    .eq('user_id', user.id)
    .filter('metadata->>business_id', 'eq', prospect.business_id)
    .or('action.eq.audit,action.eq.message,action.eq.message_copied')
    .order('created_at', { ascending: false })
    .limit(20)

  const events: TimelineEvent[] = []

  events.push({
    id: `created-${prospect.id}`,
    type: 'created',
    label: 'Prospecto añadido',
    date: prospect.created_at,
  })

  if (prospect.contacted_at) {
    events.push({
      id: `contacted-${prospect.id}`,
      type: 'status_change',
      label: 'Primer contacto registrado',
      date: prospect.contacted_at,
    })
  }

  if (prospect.notes && prospect.notes.length > 0) {
    const preview = prospect.notes.slice(0, 60) + (prospect.notes.length > 60 ? '…' : '')
    events.push({
      id: `note-${prospect.id}`,
      type: 'note',
      label: `Nota: ${preview}`,
      date: prospect.updated_at,
    })
  }

  for (const log of logs ?? []) {
    const action = log.action as string
    let type: TimelineEventType
    let label: string

    if (action === 'audit') {
      type = 'audit'
      label = 'Auditoría PDF generada'
    } else if (action === 'message_copied') {
      type = 'message_copied'
      label = 'Mensaje enviado (copiado)'
    } else {
      type = 'message'
      label = 'Mensaje generado'
    }

    events.push({
      id: `log-${log.id}`,
      type,
      label,
      date: log.created_at,
    })
  }

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return NextResponse.json({ events })
}
