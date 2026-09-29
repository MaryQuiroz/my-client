'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileForm } from '@/components/shared/ProfileForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ProfileFormData } from '@/lib/validations/profile'

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(data: ProfileFormData) {
    setLoading(true)
    setError(null)

    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, onboarding_completed: true }),
    })

    if (!response.ok) {
      setError('No se pudo guardar el perfil. Inténtalo de nuevo.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">Bienvenido a My Client</h1>
          <p className="mt-2 text-zinc-600">
            Cuéntanos sobre tu servicio para personalizar tu experiencia. Solo necesitas rellenar el
            primer campo.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tu perfil de proveedor</CardTitle>
            <CardDescription>
              Esta información se usa para generar mensajes personalizados y auditorías. Solo
              incluiremos lo que tú escribas aquí.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              onSubmit={handleSubmit}
              submitLabel="Empezar a prospectar"
              loading={loading}
              error={error}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
