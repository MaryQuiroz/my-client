'use client'

import { useState } from 'react'

interface TimelineEvent {
  id: string
  type: 'created' | 'status_change' | 'audit' | 'message' | 'message_copied' | 'note'
  label: string
  date: string
}

interface ProspectTimelineProps {
  prospectId: string
}

const TYPE_CONFIG: Record<
  TimelineEvent['type'],
  { bg: string; fg: string; symbol: string }
> = {
  created:         { bg: 'bg-blue-100',   fg: 'text-blue-600',   symbol: '+' },
  status_change:   { bg: 'bg-violet-100', fg: 'text-violet-600', symbol: '→' },
  audit:           { bg: 'bg-zinc-100',   fg: 'text-zinc-600',   symbol: 'A' },
  message:         { bg: 'bg-yellow-100', fg: 'text-yellow-700', symbol: 'M' },
  message_copied:  { bg: 'bg-green-100',  fg: 'text-green-700',  symbol: '✓' },
  note:            { bg: 'bg-zinc-100',   fg: 'text-zinc-500',   symbol: 'N' },
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'hoy'
  if (diffDays === 1) return 'ayer'
  if (diffDays < 7) return `hace ${diffDays} días`

  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export default function ProspectTimeline({ prospectId }: ProspectTimelineProps) {
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [events, setEvents] = useState<TimelineEvent[]>([])

  async function load() {
    if (loaded) return
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/prospects/${prospectId}/timeline`)
      if (!res.ok) throw new Error('error')
      const data = await res.json() as { events: TimelineEvent[] }
      setEvents(data.events)
      setLoaded(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  function toggle() {
    const next = !open
    setOpen(next)
    if (next && !loaded) void load()
  }

  return (
    <div className="space-y-1.5">
      <button
        onClick={toggle}
        className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 uppercase tracking-wide w-full hover:text-zinc-900 transition-colors"
      >
        <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Historial
        <svg
          className={`h-3 w-3 ml-auto transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-2">
          {loading && (
            <p className="text-xs text-zinc-400 flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border border-zinc-300 border-t-zinc-600" />
              Cargando…
            </p>
          )}
          {error && (
            <p className="text-xs text-red-500">No se pudo cargar el historial.</p>
          )}
          {loaded && events.length === 0 && (
            <p className="text-xs text-zinc-400">Sin actividad registrada aún.</p>
          )}
          {loaded && events.length > 0 && (
            <div className="relative pl-5">
              {/* línea vertical */}
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-zinc-200" />

              <div className="space-y-3">
                {events.map((ev) => {
                  const cfg = TYPE_CONFIG[ev.type]
                  return (
                    <div key={ev.id} className="relative">
                      {/* punto */}
                      <span
                        className={`absolute -left-5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold ${cfg.bg} ${cfg.fg}`}
                      >
                        {cfg.symbol}
                      </span>
                      <p className="text-xs text-zinc-700 leading-snug">{ev.label}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{formatDate(ev.date)}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
