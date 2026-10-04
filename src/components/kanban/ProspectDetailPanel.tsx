'use client'

import { useEffect, useRef, useState } from 'react'
// El componente recibe key={prospect.id} desde el padre — remonta al cambiar prospecto
import type { ProspectWithBusiness } from '@/lib/kanban/utils'
import RoiCalculator from '@/components/shared/RoiCalculator'
import ProposalButton from '@/components/kanban/ProposalButton'
import ProspectTimeline from '@/components/kanban/ProspectTimeline'

type ShareState = 'idle' | 'loading' | 'copied' | 'no_audit' | 'error'

interface ProspectDetailPanelProps {
  prospect: ProspectWithBusiness
  onClose: () => void
  onUpdate: (id: string, changes: Partial<ProspectWithBusiness>) => void
}

export default function ProspectDetailPanel({
  prospect,
  onClose,
  onUpdate,
}: ProspectDetailPanelProps) {
  const [notes, setNotes] = useState(prospect.notes ?? '')
  const [nextContact, setNextContact] = useState(
    prospect.next_contact_at ? prospect.next_contact_at.slice(0, 10) : ''
  )
  const [saving, setSaving] = useState(false)
  const [showRoi, setShowRoi] = useState(false)
  const [shareState, setShareState] = useState<ShareState>('idle')
  const panelRef = useRef<HTMLDivElement>(null)

  async function handleShare() {
    if (shareState === 'copied') return
    setShareState('loading')
    try {
      const latestRes = await fetch(`/api/audits/latest?businessId=${prospect.business.id}`)
      if (!latestRes.ok) {
        setShareState('no_audit')
        setTimeout(() => setShareState('idle'), 3000)
        return
      }
      const { auditId } = await latestRes.json() as { auditId: string }
      const shareRes = await fetch(`/api/audits/${auditId}/share`, { method: 'POST' })
      const data = await shareRes.json() as { url: string }
      await navigator.clipboard.writeText(window.location.origin + data.url).catch(() => {})
      setShareState('copied')
      setTimeout(() => setShareState('idle'), 3000)
    } catch {
      setShareState('error')
      setTimeout(() => setShareState('idle'), 3000)
    }
  }

  // Cerrar con Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function save(fields: { notes?: string; next_contact_at?: string | null }) {
    setSaving(true)
    try {
      const body: Record<string, unknown> = {}
      if (fields.notes !== undefined) body.notes = fields.notes || null
      if (fields.next_contact_at !== undefined) body.next_contact_at = fields.next_contact_at

      const res = await fetch(`/api/prospects/${prospect.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        onUpdate(prospect.id, {
          notes: (fields.notes ?? prospect.notes) || null,
          next_contact_at: fields.next_contact_at !== undefined
            ? fields.next_contact_at
            : prospect.next_contact_at,
        })
      }
    } finally {
      setSaving(false)
    }
  }

  function handleNotesBlur() {
    const trimmed = notes.trim()
    if (trimmed !== (prospect.notes ?? '')) {
      void save({ notes: trimmed })
    }
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setNextContact(val)
    void save({ next_contact_at: val ? new Date(val).toISOString() : null })
  }

  function clearDate() {
    setNextContact('')
    void save({ next_contact_at: null })
  }

  const isOverdue =
    prospect.next_contact_at && new Date(prospect.next_contact_at) < new Date()

  const website = prospect.business.website

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-white shadow-xl flex flex-col"
        role="dialog"
        aria-label={`Detalle: ${prospect.business.name}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-zinc-100">
          <div className="min-w-0 flex-1 pr-3">
            <p className="font-semibold text-zinc-900 truncate">{prospect.business.name}</p>
            {prospect.business.address && (
              <p className="text-xs text-zinc-500 truncate mt-0.5">{prospect.business.address}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Info del negocio */}
          <div className="space-y-2 text-sm">
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-blue-600 hover:underline truncate"
              >
                <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="truncate">{website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
            {prospect.business.phone && (
              <p className="text-zinc-600 flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {prospect.business.phone}
              </p>
            )}
          </div>

          {/* Compartir auditoría */}
          <div>
            <button
              onClick={() => void handleShare()}
              disabled={shareState === 'loading'}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 transition-colors disabled:opacity-50"
            >
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {shareState === 'loading' ? 'Generando enlace…'
                : shareState === 'copied' ? '¡Enlace copiado!'
                : shareState === 'no_audit' ? 'Sin auditoría — genera una primero'
                : shareState === 'error' ? 'Error al generar enlace'
                : 'Compartir auditoría'}
            </button>
          </div>

          {/* Propuesta comercial */}
          <ProposalButton
            businessId={prospect.business.id}
            businessName={prospect.business.name}
          />

          {/* Próximo contacto */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wide">
              Próximo contacto
            </label>
            {isOverdue && (
              <p className="text-xs font-medium text-red-600 flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                Recordatorio vencido
              </p>
            )}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={nextContact}
                onChange={handleDateChange}
                min={new Date().toISOString().slice(0, 10)}
                className="flex-1 rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
              {nextContact && (
                <button
                  onClick={clearDate}
                  className="text-xs text-zinc-400 hover:text-zinc-700"
                  title="Quitar recordatorio"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-1.5">
            <label
              htmlFor={`notes-${prospect.id}`}
              className="block text-xs font-semibold text-zinc-600 uppercase tracking-wide"
            >
              Notas
              {saving && <span className="ml-2 text-zinc-400 font-normal">Guardando…</span>}
            </label>
            <textarea
              id={`notes-${prospect.id}`}
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Escribe aquí tus anotaciones sobre este prospecto…"
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <p className="text-xs text-zinc-400">Se guarda automáticamente al salir del campo.</p>
          </div>

          {/* Calculador ROI */}
          <div className="space-y-1.5">
            <button
              onClick={() => setShowRoi((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 uppercase tracking-wide w-full hover:text-zinc-900 transition-colors"
            >
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Calcular ROI
              <svg
                className={`h-3 w-3 ml-auto transition-transform ${showRoi ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showRoi && <RoiCalculator compact initialInvestment={1200} />}
          </div>

          {/* Historial */}
          <ProspectTimeline prospectId={prospect.id} />
        </div>
      </div>
    </>
  )
}
