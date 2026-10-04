'use client'

import { useState } from 'react'
import { profileSchema, COMMUNICATION_TONES, type ProfileFormData } from '@/lib/validations/profile'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { UserProfile } from '@/types/database'

const TONE_LABELS: Record<string, string> = {
  profesional: 'Profesional',
  cercano: 'Cercano',
  directo: 'Directo',
  formal: 'Formal',
}

interface ProfileFormProps {
  defaultValues?: Partial<UserProfile>
  onSubmit: (data: ProfileFormData) => Promise<void>
  submitLabel?: string
  loading?: boolean
  error?: string | null
}

type FieldErrors = Partial<Record<keyof ProfileFormData, string>>

export function ProfileForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Guardar cambios',
  loading = false,
  error,
}: ProfileFormProps) {
  const [values, setValues] = useState<ProfileFormData>({
    service_description: defaultValues?.service_description ?? '',
    service_promise: defaultValues?.service_promise ?? '',
    social_proof: defaultValues?.social_proof ?? '',
    ideal_client: defaultValues?.ideal_client ?? '',
    communication_tone:
      (defaultValues?.communication_tone as ProfileFormData['communication_tone']) ?? 'profesional',
    business_name: defaultValues?.business_name ?? '',
    logo_url: defaultValues?.logo_url ?? '',
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  function handleChange(field: keyof ProfileFormData, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = profileSchema.safeParse(values)

    if (!result.success) {
      const flat = result.error.flatten().fieldErrors
      const newErrors: FieldErrors = {}
      for (const [k, msgs] of Object.entries(flat)) {
        if (msgs?.[0]) newErrors[k as keyof ProfileFormData] = msgs[0]
      }
      setFieldErrors(newErrors)
      return
    }

    await onSubmit(result.data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Servicio (obligatorio) */}
      <div className="space-y-2">
        <Label htmlFor="service_description">
          ¿Qué ofreces? <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="service_description"
          placeholder="Ej: Diseño y desarrollo de páginas web para negocios locales, con entrega en 2 semanas."
          rows={3}
          value={values.service_description}
          onChange={(e) => handleChange('service_description', e.target.value)}
        />
        {fieldErrors.service_description && (
          <p className="text-sm text-red-600">{fieldErrors.service_description}</p>
        )}
      </div>

      {/* Promesa (opcional) */}
      <div className="space-y-2">
        <Label htmlFor="service_promise">
          Resultado que prometes{' '}
          <span className="text-zinc-400 text-xs font-normal">(opcional)</span>
        </Label>
        <Textarea
          id="service_promise"
          placeholder="Ej: Una web profesional lista para funcionar en 2 semanas, sin pagar mensualmente."
          rows={2}
          value={values.service_promise ?? ''}
          onChange={(e) => handleChange('service_promise', e.target.value)}
        />
        <p className="text-xs text-zinc-500">
          Solo lo que escribas aquí podrá usarse como promesa en los mensajes generados.
        </p>
        {fieldErrors.service_promise && (
          <p className="text-sm text-red-600">{fieldErrors.service_promise}</p>
        )}
      </div>

      {/* Prueba social (opcional) */}
      <div className="space-y-2">
        <Label htmlFor="social_proof">
          Casos de éxito o prueba social{' '}
          <span className="text-zinc-400 text-xs font-normal">(opcional)</span>
        </Label>
        <Textarea
          id="social_proof"
          placeholder="Ej: He ayudado a 12 restaurantes de Madrid a conseguir reservas online."
          rows={2}
          value={values.social_proof ?? ''}
          onChange={(e) => handleChange('social_proof', e.target.value)}
        />
        <p className="text-xs text-zinc-500">
          Solo incluye datos reales y verificables. No se incluirá nada que no esté escrito aquí.
        </p>
        {fieldErrors.social_proof && (
          <p className="text-sm text-red-600">{fieldErrors.social_proof}</p>
        )}
      </div>

      {/* Cliente ideal (opcional) */}
      <div className="space-y-2">
        <Label htmlFor="ideal_client">
          Cliente ideal{' '}
          <span className="text-zinc-400 text-xs font-normal">(opcional)</span>
        </Label>
        <Input
          id="ideal_client"
          placeholder="Ej: Restaurantes y cafeterías de Madrid sin web propia"
          value={values.ideal_client ?? ''}
          onChange={(e) => handleChange('ideal_client', e.target.value)}
        />
        {fieldErrors.ideal_client && (
          <p className="text-sm text-red-600">{fieldErrors.ideal_client}</p>
        )}
      </div>

      {/* Tono */}
      <div className="space-y-2">
        <Label htmlFor="communication_tone">Tono de comunicación</Label>
        <Select
          value={values.communication_tone}
          onValueChange={(val) => {
            if (val !== null) handleChange('communication_tone', val)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un tono" />
          </SelectTrigger>
          <SelectContent>
            {COMMUNICATION_TONES.map((t) => (
              <SelectItem key={t} value={t}>
                {TONE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors.communication_tone && (
          <p className="text-sm text-red-600">{fieldErrors.communication_tone}</p>
        )}
      </div>

      {/* Nombre del negocio */}
      <div className="space-y-2">
        <Label htmlFor="business_name">
          Nombre de tu negocio / freelance{' '}
          <span className="text-zinc-400 text-xs font-normal">(opcional)</span>
        </Label>
        <Input
          id="business_name"
          placeholder="Ej: Estudio Web Ana García"
          value={values.business_name ?? ''}
          onChange={(e) => handleChange('business_name', e.target.value)}
        />
        {fieldErrors.business_name && (
          <p className="text-sm text-red-600">{fieldErrors.business_name}</p>
        )}
      </div>

      {/* Logo URL */}
      <div className="space-y-2">
        <Label htmlFor="logo_url">
          URL de tu logo{' '}
          <span className="text-zinc-400 text-xs font-normal">(opcional)</span>
        </Label>
        <Input
          id="logo_url"
          type="url"
          placeholder="https://tudominio.com/logo.png"
          value={values.logo_url ?? ''}
          onChange={(e) => handleChange('logo_url', e.target.value)}
        />
        <p className="text-xs text-zinc-500">Se usará en las auditorías en PDF.</p>
        {fieldErrors.logo_url && <p className="text-sm text-red-600">{fieldErrors.logo_url}</p>}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || values.service_description.trim().length < 10}
        className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Guardando...' : submitLabel}
      </button>
    </form>
  )
}
