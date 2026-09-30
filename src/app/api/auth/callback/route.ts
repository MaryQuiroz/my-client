import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { captureEvent } from '@/lib/analytics/posthog-server'

// Intercambia el código de Supabase Auth (magic link) por una sesión
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Comprobar si el usuario tiene perfil para decidir si va a onboarding
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('users_profile')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()

        if (!profile || !profile.onboarding_completed) {
          void captureEvent(user.id, 'user_signed_up')
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
