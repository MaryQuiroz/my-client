import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { messageCopySchema } from '@/lib/validations/message'

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

  const parsed = messageCopySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 422 })
  }

  await supabase
    .from('messages')
    .update({ copied_at: new Date().toISOString() })
    .eq('id', parsed.data.messageId)
    .eq('user_id', user.id)

  return NextResponse.json({ ok: true })
}
