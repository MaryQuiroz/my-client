'use client'

import { useState } from 'react'
import { ProfileForm } from '@/components/shared/ProfileForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ProfileFormData } from '@/lib/validations/profile'
import type { UserProfile } from '@/types/database'

interface ProfilePageClientProps {
  profile: UserProfile | null
}

export function ProfilePageClient({ profile }: ProfilePageClientProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(data: ProfileFormData) {
    setLoading(true)
    setError(null)
    setSaved(false)

    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      setError('No se pudo guardar el perfil. Inténtalo de nuevo.')
    } else {
      setSaved(true)
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Mi perfil</h1>
        <p className="mt-1 text-zinc-600">
          Esta información se usa para personalizar las auditorías y los mensajes generados.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de tu servicio</CardTitle>
          <CardDescription>
            Solo incluiremos en los mensajes lo que hayas escrito aquí. Sin datos inventados ni
            garantías no escritas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {saved && (
            <p className="mb-4 text-sm text-green-600 font-medium">
              Perfil guardado correctamente.
            </p>
          )}
          <ProfileForm
            defaultValues={profile ?? undefined}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  )
}
