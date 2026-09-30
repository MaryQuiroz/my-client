'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { searchSchema, type SearchFormData } from '@/lib/validations/search'

interface SearchFormProps {
  onResults: (results: SearchResult[], quota: QuotaInfo) => void
  onLoading: (loading: boolean) => void
}

export interface SearchResult {
  placeId: string
  businessId?: string | null
  name: string
  address: string
  phone?: string
  websiteUrl?: string
  googleRating?: number
  googleReviewsCount?: number
  lat: number
  lng: number
  alreadySaved: boolean
}

export interface QuotaInfo {
  used: number
  limit: number
  plan: string
}

export default function SearchForm({ onResults, onLoading }: SearchFormProps) {
  const [fields, setFields] = useState<SearchFormData>({ query: '', location: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof SearchFormData, string>>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  function handleChange(key: keyof SearchFormData, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)

    const parsed = searchSchema.safeParse(fields)
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors
      setErrors({
        query: flat.query?.[0],
        location: flat.location?.[0],
      })
      return
    }

    onLoading(true)
    try {
      const res = await fetch('/api/places/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })

      const data = await res.json()

      if (!res.ok) {
        setServerError(data.error ?? 'Error al buscar negocios')
        return
      }

      onResults(data.results, data.quota)
    } catch {
      setServerError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      onLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-1">
        <Label htmlFor="query">Tipo de negocio</Label>
        <Input
          id="query"
          placeholder="ej. peluquería, fontanero, restaurante..."
          value={fields.query}
          onChange={(e) => handleChange('query', e.target.value)}
          aria-invalid={!!errors.query}
        />
        {errors.query && <p className="text-xs text-red-600">{errors.query}</p>}
      </div>

      <div className="flex-1 space-y-1">
        <Label htmlFor="location">Zona o ciudad</Label>
        <Input
          id="location"
          placeholder="ej. Barcelona, Madrid centro..."
          value={fields.location}
          onChange={(e) => handleChange('location', e.target.value)}
          aria-invalid={!!errors.location}
        />
        {errors.location && <p className="text-xs text-red-600">{errors.location}</p>}
      </div>

      <Button type="submit" className="shrink-0">
        Buscar
      </Button>

      {serverError && (
        <p className="w-full text-sm text-red-600">{serverError}</p>
      )}
    </form>
  )
}
