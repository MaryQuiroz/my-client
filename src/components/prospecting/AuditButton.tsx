'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface AuditButtonProps {
  businessId: string
  scoreId: string
}

type AuditState =
  | { status: 'idle' }
  | { status: 'generating' }
  | { status: 'done'; pdfUrl: string }
  | { status: 'error'; message: string }

export default function AuditButton({ businessId, scoreId }: AuditButtonProps) {
  const [state, setState] = useState<AuditState>({ status: 'idle' })

  async function handleGenerate() {
    setState({ status: 'generating' })

    try {
      const res = await fetch('/api/audit/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, scoreId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setState({ status: 'error', message: data.error ?? 'Error al generar auditoría' })
        return
      }

      setState({ status: 'done', pdfUrl: data.pdfUrl })
      window.open(data.pdfUrl, '_blank', 'noopener,noreferrer')
    } catch {
      setState({ status: 'error', message: 'Error de conexión' })
    }
  }

  if (state.status === 'generating') {
    return (
      <p className="text-xs text-zinc-400 animate-pulse text-center py-1">
        Generando PDF…
      </p>
    )
  }

  if (state.status === 'done') {
    return (
      <a
        href={state.pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center text-xs text-blue-600 hover:underline py-1"
      >
        Descargar auditoría PDF
      </a>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-1">
        <p className="text-xs text-red-600">{state.message}</p>
        <Button size="sm" variant="outline" onClick={handleGenerate} className="w-full">
          Reintentar auditoría
        </Button>
      </div>
    )
  }

  return (
    <Button size="sm" variant="outline" onClick={handleGenerate} className="w-full">
      Generar auditoría PDF
    </Button>
  )
}
