'use client'

import { useState } from 'react'
import { manualBusinessSchema, type ManualBusinessData } from '@/lib/validations/manual-business'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { SearchResult } from './SearchForm'

interface AddManualFormProps {
  onAdded: (result: SearchResult) => void
}

type FieldErrors = Partial<Record<keyof ManualBusinessData, string>>

export default function AddManualForm({ onAdded }: AddManualFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [values, setValues] = useState<ManualBusinessData>({
    name: '',
    website: '',
    category: '',
    city: '',
    phone: '',
    address: '',
  })

  function handleChange(field: keyof ManualBusinessData, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const parsed = manualBusinessSchema.safeParse(values)
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors
      const errs: FieldErrors = {}
      for (const [k, msgs] of Object.entries(flat)) {
        if (msgs?.[0]) errs[k as keyof ManualBusinessData] = msgs[0]
      }
      setFieldErrors(errs)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/businesses/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Error al guardar el negocio')
        return
      }
      onAdded(json.result as SearchResult)
      setOpen(false)
      setValues({ name: '', website: '', category: '', city: '', phone: '', address: '' })
      setFieldErrors({})
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors rounded-lg"
      >
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Añadir negocio manualmente
        </span>
        <svg
          className={`h-4 w-4 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="border-t border-zinc-100 px-4 py-4 space-y-4">
          <p className="text-xs text-zinc-500">
            El negocio se añade directamente a tu pipeline. Si introduces la web, podrás auditarla.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Nombre */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="m-name">
                Nombre del negocio <span className="text-red-500">*</span>
              </Label>
              <Input
                id="m-name"
                placeholder="Ej: Restaurante El Rincón"
                value={values.name}
                onChange={(e) => handleChange('name', e.target.value)}
                autoFocus
              />
              {fieldErrors.name && <p className="text-xs text-red-600">{fieldErrors.name}</p>}
            </div>

            {/* Web */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="m-website">
                Página web{' '}
                <span className="text-zinc-400 text-xs font-normal">(opcional — necesaria para auditar)</span>
              </Label>
              <Input
                id="m-website"
                type="text"
                placeholder="sunegocio.com"
                value={values.website ?? ''}
                onChange={(e) => handleChange('website', e.target.value)}
              />
              {fieldErrors.website && <p className="text-xs text-red-600">{fieldErrors.website}</p>}
            </div>

            {/* Sector */}
            <div className="space-y-1.5">
              <Label htmlFor="m-category">Sector <span className="text-zinc-400 text-xs font-normal">(opcional)</span></Label>
              <Input
                id="m-category"
                placeholder="Restaurante, Peluquería…"
                value={values.category ?? ''}
                onChange={(e) => handleChange('category', e.target.value)}
              />
            </div>

            {/* Ciudad */}
            <div className="space-y-1.5">
              <Label htmlFor="m-city">Ciudad <span className="text-zinc-400 text-xs font-normal">(opcional)</span></Label>
              <Input
                id="m-city"
                placeholder="Madrid, Valencia…"
                value={values.city ?? ''}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-1.5">
              <Label htmlFor="m-phone">Teléfono <span className="text-zinc-400 text-xs font-normal">(opcional)</span></Label>
              <Input
                id="m-phone"
                type="tel"
                placeholder="+34 600 000 000"
                value={values.phone ?? ''}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>

            {/* Dirección */}
            <div className="space-y-1.5">
              <Label htmlFor="m-address">Dirección <span className="text-zinc-400 text-xs font-normal">(opcional)</span></Label>
              <Input
                id="m-address"
                placeholder="Calle Mayor 1"
                value={values.address ?? ''}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || values.name.trim().length < 2}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Guardando…' : 'Añadir al pipeline'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
