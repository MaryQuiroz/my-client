'use client'

import { useState } from 'react'

interface ProposalButtonProps {
  businessId: string
  businessName: string
}

type FormState = {
  solutionTitle: string
  solutionDescription: string
  price: string
  deliveryWeeks: string
  includesHosting: boolean
  includesSeo: boolean
}

const DEFAULT_FORM: FormState = {
  solutionTitle: 'Nueva web profesional',
  solutionDescription: '',
  price: '900',
  deliveryWeeks: '3',
  includesHosting: false,
  includesSeo: false,
}

type ViewState = 'idle' | 'form' | 'generating'

export default function ProposalButton({ businessId, businessName }: ProposalButtonProps) {
  const [view, setView] = useState<ViewState>('idle')
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    const price = parseInt(form.price, 10)
    const deliveryWeeks = parseInt(form.deliveryWeeks, 10)

    if (!form.solutionTitle.trim() || form.solutionTitle.trim().length < 3) {
      setError('El título debe tener al menos 3 caracteres')
      return
    }
    if (!form.solutionDescription.trim() || form.solutionDescription.trim().length < 10) {
      setError('La descripción debe tener al menos 10 caracteres')
      return
    }
    if (isNaN(price) || price < 1) {
      setError('Introduce un precio válido')
      return
    }

    setError(null)
    setView('generating')

    try {
      const res = await fetch('/api/proposals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          solutionTitle: form.solutionTitle.trim(),
          solutionDescription: form.solutionDescription.trim(),
          price,
          deliveryWeeks: isNaN(deliveryWeeks) ? 3 : deliveryWeeks,
          includesHosting: form.includesHosting,
          includesSeo: form.includesSeo,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? 'Error al generar propuesta')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `propuesta-${businessName.replace(/\s+/g, '-').toLowerCase()}.pdf`
      a.click()
      URL.revokeObjectURL(url)

      setView('idle')
      setForm(DEFAULT_FORM)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar propuesta')
      setView('form')
    }
  }

  if (view === 'idle') {
    return (
      <button
        onClick={() => setView('form')}
        className="w-full flex items-center justify-center gap-1.5 rounded-md border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
      >
        <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Generar propuesta PDF
      </button>
    )
  }

  if (view === 'generating') {
    return (
      <div className="w-full flex items-center justify-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-xs text-zinc-500">
        <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Generando PDF…
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-md border border-zinc-200 p-3">
      <p className="text-xs font-semibold text-zinc-700">Propuesta comercial PDF</p>

      <div className="space-y-2">
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Título de la propuesta</label>
          <input
            type="text"
            value={form.solutionTitle}
            onChange={(e) => setForm((f) => ({ ...f, solutionTitle: e.target.value }))}
            maxLength={200}
            className="w-full rounded border border-zinc-200 px-2 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            placeholder="Nueva web profesional"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-1">Descripción del servicio</label>
          <textarea
            rows={3}
            value={form.solutionDescription}
            onChange={(e) => setForm((f) => ({ ...f, solutionDescription: e.target.value }))}
            maxLength={1000}
            className="w-full rounded border border-zinc-200 px-2 py-1.5 text-xs text-zinc-900 resize-none focus:outline-none focus:ring-1 focus:ring-zinc-900"
            placeholder="Describe brevemente qué vas a hacer para este negocio…"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs text-zinc-500 mb-1">Precio (€)</label>
            <input
              type="number"
              min={1}
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="w-full rounded border border-zinc-200 px-2 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-zinc-500 mb-1">Plazo (semanas)</label>
            <input
              type="number"
              min={1}
              max={52}
              value={form.deliveryWeeks}
              onChange={(e) => setForm((f) => ({ ...f, deliveryWeeks: e.target.value }))}
              className="w-full rounded border border-zinc-200 px-2 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 text-xs text-zinc-600 cursor-pointer">
            <input
              type="checkbox"
              checked={form.includesHosting}
              onChange={(e) => setForm((f) => ({ ...f, includesHosting: e.target.checked }))}
              className="rounded"
            />
            Incluye hosting
          </label>
          <label className="flex items-center gap-1.5 text-xs text-zinc-600 cursor-pointer">
            <input
              type="checkbox"
              checked={form.includesSeo}
              onChange={(e) => setForm((f) => ({ ...f, includesSeo: e.target.checked }))}
              className="rounded"
            />
            Incluye SEO
          </label>
        </div>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={() => { setView('idle'); setError(null) }}
          className="flex-1 rounded border border-zinc-200 px-2 py-1.5 text-xs text-zinc-500 hover:bg-zinc-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleGenerate}
          className="flex-1 rounded bg-zinc-900 px-2 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          Generar PDF
        </button>
      </div>
    </div>
  )
}
