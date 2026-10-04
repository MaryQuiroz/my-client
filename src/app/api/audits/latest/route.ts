import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const rl = checkRateLimit(user.id)
  if (!rl.success) {
    return NextResponse.json({ error: 'Demasiadas peticiones.' }, { status: 429 })
  }

  const businessId = request.nextUrl.searchParams.get('businessId')
  if (!businessId) {
    return NextResponse.json({ error: 'businessId requerido' }, { status: 400 })
  }

  const { data: audit } = await supabase
    .from('audits')
    .select('id')
    .eq('user_id', user.id)
    .eq('business_id', businessId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!audit) {
    return NextResponse.json({ error: 'No hay auditorías para este negocio' }, { status: 404 })
  }

  return NextResponse.json({ auditId: audit.id })
}
