import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(
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
    return NextResponse.json({ error: 'Demasiadas peticiones.' }, { status: 429 })
  }

  const { id } = await params

  const { data: audit } = await supabase
    .from('audits')
    .select('id, business_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!audit) {
    return NextResponse.json({ error: 'Auditoría no encontrada' }, { status: 404 })
  }

  const admin = createAdminClient()

  // Reutilizar token existente no expirado
  const { data: existing } = await (admin.from as CallableFunction)('audit_share_tokens')
    .select('token')
    .eq('audit_id', id)
    .gt('expires_at', new Date().toISOString())
    .limit(1)
    .maybeSingle() as { data: { token: string } | null }

  if (existing) {
    return NextResponse.json({ token: existing.token, url: `/a/${existing.token}` })
  }

  const { data: created, error: insertError } = await (admin.from as CallableFunction)(
    'audit_share_tokens'
  )
    .insert({ audit_id: id, user_id: user.id, business_id: audit.business_id })
    .select('token')
    .single() as { data: { token: string } | null; error: unknown }

  if (insertError || !created) {
    return NextResponse.json({ error: 'No se pudo crear el enlace' }, { status: 500 })
  }

  return NextResponse.json({ token: created.token, url: `/a/${created.token}` })
}
