'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setError('No se pudo enviar el enlace. Comprueba el email e inténtalo de nuevo.')
    } else {
      setSent(true)
    }

    setLoading(false)
  }

  if (sent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revisa tu email</CardTitle>
          <CardDescription>
            Te hemos enviado un enlace de acceso a <strong>{email}</strong>. Haz clic en él para
            entrar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button
            className="text-sm text-zinc-500 hover:text-zinc-900 underline"
            onClick={() => setSent(false)}
          >
            Usar otro email
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrar en My Client</CardTitle>
        <CardDescription>
          Te enviamos un enlace mágico a tu email. Sin contraseña.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Enviando...' : 'Enviar enlace de acceso'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-500">
          ¿Primera vez?{' '}
          <Link href="/registro" className="text-zinc-900 font-medium hover:underline">
            Crear cuenta
          </Link>
        </p>
        {/* TODO-LEGAL: añadir enlace a política de privacidad (Fase 13) */}
      </CardContent>
    </Card>
  )
}
