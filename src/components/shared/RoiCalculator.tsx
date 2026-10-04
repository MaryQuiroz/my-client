'use client'

import { useState } from 'react'

interface RoiCalculatorProps {
  initialInvestment?: number
  compact?: boolean
}

export default function RoiCalculator({ initialInvestment = 900, compact = false }: RoiCalculatorProps) {
  const [visitantes, setVisitantes] = useState(500)
  const [conversion, setConversion] = useState(2)
  const [ticket, setTicket] = useState(80)
  const [coste, setCoste] = useState(initialInvestment)

  const clientesMes = (visitantes * conversion) / 100
  const ingresosMes = clientesMes * ticket
  const roiMeses = ingresosMes > 0 ? coste / ingresosMes : 0
  const retornoAnual = ingresosMes * 12 - coste

  const hasResults = ingresosMes > 0

  function roiLabel() {
    if (!hasResults) return '—'
    if (roiMeses < 1) return 'Menos de 1 mes'
    return `${roiMeses.toFixed(1)} meses`
  }

  const inputClass =
    'w-full rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900'
  const labelClass = 'block text-xs font-medium text-zinc-600 mb-1'

  return (
    <div className={`rounded-lg border border-zinc-200 bg-white ${compact ? 'p-3' : 'p-5'}`}>
      {!compact && (
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">
          Calculador de ROI — ¿Cuánto puede ganar tu negocio?
        </h2>
      )}

      <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
        {/* Inputs */}
        <div className="space-y-3">
          {!compact && (
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Datos del negocio</p>
          )}
          <div>
            <label className={labelClass}>Visitantes potenciales/mes</label>
            <input
              type="number"
              min={0}
              value={visitantes}
              onChange={(e) => setVisitantes(Math.max(0, Number(e.target.value)))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Tasa de conversión (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={conversion}
              onChange={(e) => setConversion(Math.max(0, Number(e.target.value)))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Ticket medio (€)</label>
            <input
              type="number"
              min={0}
              value={ticket}
              onChange={(e) => setTicket(Math.max(0, Number(e.target.value)))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Coste de la web (€)</label>
            <input
              type="number"
              min={0}
              value={coste}
              onChange={(e) => setCoste(Math.max(0, Number(e.target.value)))}
              className={inputClass}
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {!compact && (
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Resultados estimados</p>
          )}
          {!hasResults ? (
            <p className="text-sm text-zinc-400 pt-2">Introduce datos para calcular</p>
          ) : (
            <>
              <div className="rounded-md bg-zinc-50 p-3 space-y-3">
                <div>
                  <p className="text-xs text-zinc-500">Clientes nuevos/mes</p>
                  <p className={`font-bold text-zinc-900 ${compact ? 'text-lg' : 'text-2xl'}`}>
                    {clientesMes % 1 === 0 ? clientesMes : clientesMes.toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Ingresos nuevos/mes</p>
                  <p className={`font-bold text-green-600 ${compact ? 'text-lg' : 'text-2xl'}`}>
                    {ingresosMes.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Recuperas la inversión en</p>
                  <p className={`font-bold text-zinc-900 ${compact ? 'text-lg' : 'text-2xl'}`}>
                    {roiLabel()}
                  </p>
                </div>
                {retornoAnual > 0 && (
                  <div className="pt-1 border-t border-zinc-200">
                    <p className="text-xs text-zinc-500">Retorno anual estimado</p>
                    <p className={`font-bold text-green-600 ${compact ? 'text-lg' : 'text-2xl'}`}>
                      📈 {retornoAnual.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-zinc-400">
        Estimación orientativa basada en los datos introducidos.
      </p>
    </div>
  )
}
