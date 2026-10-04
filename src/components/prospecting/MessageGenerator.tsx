// TODO-LEGAL: Los mensajes generados son borradores. El envío es manual y
// responsabilidad del usuario (LSSI art. 21 para comunicaciones comerciales).
// Revisar con abogado antes de usar en campañas masivas.

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import UpgradeGate from '@/components/shared/UpgradeGate'

interface MessageGeneratorProps {
  businessId: string
  scoreId: string
}

type Channel = 'whatsapp' | 'email' | 'llamada'

type GenState =
  | { status: 'idle' }
  | { status: 'generating' }
  | { status: 'done'; messageId: string; content: string; channel: Channel }
  | { status: 'error'; message: string }
  | { status: 'quota'; used: number; limit: number }

const CHANNEL_LABELS: Record<Channel, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
  llamada: 'Llamada',
}

export default function MessageGenerator({ businessId, scoreId }: MessageGeneratorProps) {
  const [channel, setChannel] = useState<Channel>('whatsapp')
  const [sectorOverride, setSectorOverride] = useState('')
  const [state, setState] = useState<GenState>({ status: 'idle' })
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    setState({ status: 'generating' })
    setCopied(false)

    try {
      const body: Record<string, unknown> = { businessId, scoreId, channel }
      if (sectorOverride.trim()) body.sectorOverride = sectorOverride.trim()

      const res = await fetch('/api/messages/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (res.status === 429 && data.used !== undefined) {
        setState({ status: 'quota', used: data.used as number, limit: data.limit as number })
        return
      }

      if (!res.ok) {
        setState({ status: 'error', message: data.error ?? 'Error al generar mensaje' })
        return
      }

      setState({ status: 'done', messageId: data.messageId, content: data.content, channel })
    } catch {
      setState({ status: 'error', message: 'Error de conexión' })
    }
  }

  async function handleCopy(messageId: string, content: string) {
    try {
      await navigator.clipboard.writeText(content)
    } catch {
      // fallback para navegadores sin permisos de portapapeles
    }

    setCopied(true)

    fetch('/api/messages/copy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId }),
    }).catch(() => {})
  }

  return (
    <div className="mt-3 space-y-2 border-t pt-3">
      <p className="text-xs font-medium text-zinc-600">Generar mensaje de contacto</p>

      {/* Selector de canal */}
      <div className="flex gap-1">
        {(['whatsapp', 'email', 'llamada'] as Channel[]).map((c) => (
          <button
            key={c}
            onClick={() => { setChannel(c); setState({ status: 'idle' }); setCopied(false) }}
            className={`flex-1 rounded border px-2 py-1 text-xs transition-colors ${
              channel === c
                ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                : 'border-zinc-200 text-zinc-500 hover:border-zinc-300'
            }`}
          >
            {CHANNEL_LABELS[c]}
          </button>
        ))}
      </div>

      {/* Sector override */}
      <div>
        <label className="block text-xs text-zinc-500 mb-1">Sector (mejora el mensaje)</label>
        <input
          type="text"
          value={sectorOverride}
          onChange={(e) => setSectorOverride(e.target.value)}
          maxLength={50}
          placeholder="ej. restaurante, peluquería…"
          className="w-full rounded border border-zinc-200 px-2 py-1 text-xs text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      {/* Botón generar / gate de cuota */}
      {state.status === 'quota' ? (
        <UpgradeGate allowed={false} used={state.used} limit={state.limit} action="mensaje">
          <Button size="sm" variant="outline" className="w-full">
            Generar mensaje
          </Button>
        </UpgradeGate>
      ) : (
        state.status !== 'done' && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerate}
            disabled={state.status === 'generating'}
            className="w-full"
          >
            {state.status === 'generating' ? 'Generando…' : 'Generar mensaje'}
          </Button>
        )
      )}

      {/* Error */}
      {state.status === 'error' && (
        <p className="text-xs text-red-600">{state.message}</p>
      )}

      {/* Resultado */}
      {state.status === 'done' && (
        <div className="space-y-2">
          <textarea
            readOnly
            value={state.content}
            rows={6}
            className="w-full resize-none rounded border border-zinc-200 bg-zinc-50 p-2 text-xs text-zinc-700 focus:outline-none"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(state.messageId, state.content)}
              className="flex-1"
            >
              {copied ? '¡Copiado!' : 'Copiar'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerate}
              className="flex-1"
            >
              Regenerar
            </Button>
          </div>
          <p className="text-xs text-zinc-400">
            {/* TODO-LEGAL */}
            Borrador generado por IA. El envío es manual y responsabilidad tuya (LSSI/RGPD).
          </p>
        </div>
      )}
    </div>
  )
}
