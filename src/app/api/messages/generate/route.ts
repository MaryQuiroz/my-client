import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit } from '@/lib/rate-limit'
import { messageRequestSchema } from '@/lib/validations/message'
import { generateMessage } from '@/lib/messages/generator'
import { getSectorHint } from '@/lib/messages/sector-hints'
import { checkQuota } from '@/lib/quota'
import { captureEvent } from '@/lib/analytics/posthog-server'
import type { SignalBreakdown } from '@/lib/scoring/scorer'

export async function POST(request: NextRequest) {
  // 1. Auth
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
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

  const parsed = messageRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { businessId, scoreId, channel, sectorOverride } = parsed.data
  const admin = createAdminClient()

  // 4. Verificar negocio
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('id, name, address, category')
    .eq('id', businessId)
    .eq('user_id', user.id)
    .single()

  if (bizError || !business) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
  }

  // 5. Obtener score
  const { data: score, error: scoreError } = await supabase
    .from('scores')
    .select('id, total_score, breakdown')
    .eq('id', scoreId)
    .eq('user_id', user.id)
    .single()

  if (scoreError || !score) {
    return NextResponse.json({ error: 'Puntuación no encontrada' }, { status: 404 })
  }

  // 6. Cuota mensual
  const quota = await checkQuota(user.id, 'message', admin)
  if (!quota.allowed) {
    return NextResponse.json(
      { error: 'Has alcanzado el límite de mensajes de tu plan.', ...quota },
      { status: 429 }
    )
  }

  // 7. Perfil del freelancer
  const { data: profile } = await supabase
    .from('users_profile')
    .select('business_name, service_description, service_promise, communication_tone, social_proof')
    .eq('id', user.id)
    .single()

  // 8. UPSERT prospect (auto-crear si no existe)
  await admin
    .from('prospects')
    .upsert(
      { user_id: user.id, business_id: businessId, status: 'nuevo' },
      { onConflict: 'user_id,business_id', ignoreDuplicates: true }
    )

  const { data: prospect } = await supabase
    .from('prospects')
    .select('id')
    .eq('user_id', user.id)
    .eq('business_id', businessId)
    .single()

  if (!prospect) {
    return NextResponse.json({ error: 'Error al crear prospecto' }, { status: 500 })
  }

  // 9. Generar mensaje con Anthropic
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 500 })
  }

  const breakdown = score.breakdown as unknown as SignalBreakdown[]
  const firedSignals = breakdown
    .filter((s) => s.fired && s.source !== 'unavailable')
    .map((s) => s.label)

  const categoryForHint = sectorOverride ?? business.category ?? null
  const sectorHint = getSectorHint(categoryForHint)

  let content: string
  try {
    content = await generateMessage(
      {
        businessName: business.name,
        address: business.address ?? '',
        channel,
        firedSignals,
        totalScore: score.total_score,
        freelancerName: profile?.business_name ?? '',
        serviceDescription: profile?.service_description ?? '',
        servicePromise: profile?.service_promise ?? null,
        communicationTone: profile?.communication_tone ?? 'informal',
        socialProof: profile?.social_proof ?? null,
        sectorHint,
      },
      apiKey
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: `Error generando mensaje: ${message}` }, { status: 502 })
  }

  // 10. Guardar mensaje
  const { data: savedMessage, error: msgError } = await admin
    .from('messages')
    .insert({
      user_id: user.id,
      prospect_id: prospect.id,
      channel,
      content,
      variant: 1,
      is_followup: false,
    })
    .select('id')
    .single()

  if (msgError || !savedMessage) {
    return NextResponse.json({ error: 'Error al guardar mensaje' }, { status: 500 })
  }

  // 11. Registrar uso
  await admin.from('usage_logs').insert({
    user_id: user.id,
    action: 'message',
    metadata: { business_id: businessId, channel, message_id: savedMessage.id },
  })

  void captureEvent(user.id, 'message_generated', { channel })

  return NextResponse.json({
    messageId: savedMessage.id,
    content,
    channel,
  })
}
