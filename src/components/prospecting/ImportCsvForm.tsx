'use client'

import { useRef, useState } from 'react'
import { parseCsv, type CsvRow } from '@/lib/validations/csv-import'

interface ImportCsvFormProps {
  onImported: (count: number) => void
}

export default function ImportCsvForm({ onImported }: ImportCsvFormProps) {
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<CsvRow[]>([])
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setApiError(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const { rows: parsed, errors } = parseCsv(text)
      setRows(parsed)
      setParseErrors(errors)
    }
    reader.readAsText(file, 'UTF-8')
  }

  async function handleImport() {
    if (rows.length === 0) return
    setLoading(true)
    setApiError(null)
    try {
      const res = await fetch('/api/businesses/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      })
      const json = await res.json() as { imported?: number; skipped?: number; error?: string }
      if (!res.ok) {
        setApiError(json.error ?? 'Error al importar')
        return
      }
      onImported(json.imported ?? 0)
      setOpen(false)
      setRows([])
      setParseErrors([])
      if (fileRef.current) fileRef.current.value = ''
    } catch {
      setApiError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setOpen(false)
    setRows([])
    setParseErrors([])
    setApiError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white">
      <button
        type="button"
        onClick={() => (open ? handleClose() : setOpen(true))}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors rounded-lg"
      >
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Importar CSV
        </span>
        <svg
          className={`h-4 w-4 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-zinc-100 px-4 py-4 space-y-4">
          <p className="text-xs text-zinc-500">
            Sube un CSV con columnas: <strong>nombre</strong>, web, sector, ciudad, teléfono.
            Todos los negocios se añaden al pipeline en estado «Nuevo».
          </p>

          <div className="flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFile}
              className="text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-700 file:cursor-pointer hover:file:bg-zinc-200"
            />
            <a
              href="data:text/csv;charset=utf-8,nombre,web,sector,ciudad,telefono%0AEjemplo Restaurante,https://ejemplo.com,Restaurante,Madrid,600000000"
              download="plantilla-my-client.csv"
              className="text-xs text-zinc-500 hover:text-zinc-700 underline whitespace-nowrap"
            >
              Descargar plantilla
            </a>
          </div>

          {(rows.length > 0 || parseErrors.length > 0) && (
            <div className="space-y-2">
              {rows.length > 0 && (
                <p className="text-sm text-zinc-700">
                  <span className="font-medium text-green-700">{rows.length} fila{rows.length !== 1 ? 's' : ''} válida{rows.length !== 1 ? 's' : ''}</span>
                  {parseErrors.length > 0 && (
                    <span className="text-zinc-500"> · {parseErrors.length} con error{parseErrors.length !== 1 ? 'es' : ''}</span>
                  )}
                </p>
              )}
              {parseErrors.length > 0 && rows.length === 0 && (
                <p className="text-sm text-red-600">{parseErrors[0]}</p>
              )}
              {parseErrors.length > 0 && rows.length > 0 && (
                <details className="text-xs text-zinc-500">
                  <summary className="cursor-pointer hover:text-zinc-700">Ver errores ({parseErrors.length})</summary>
                  <ul className="mt-1 space-y-0.5 pl-3">
                    {parseErrors.map((err, i) => (
                      <li key={i} className="text-red-500">{err}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          {apiError && <p className="text-sm text-red-600">{apiError}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleImport}
              disabled={loading || rows.length === 0}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Importando…
                </>
              ) : (
                `Importar ${rows.length > 0 ? rows.length : ''} negocio${rows.length !== 1 ? 's' : ''}`
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
