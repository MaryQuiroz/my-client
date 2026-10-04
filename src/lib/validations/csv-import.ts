import { z } from 'zod'

export const csvRowSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio (mínimo 2 caracteres)').max(200),
  website: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
})

export type CsvRow = z.infer<typeof csvRowSchema>

export const CSV_HEADERS: Record<keyof CsvRow, string[]> = {
  name: ['nombre', 'name', 'negocio', 'empresa'],
  website: ['web', 'website', 'url', 'página', 'pagina'],
  category: ['sector', 'category', 'tipo', 'categoria'],
  city: ['ciudad', 'city', 'localidad', 'provincia'],
  phone: ['teléfono', 'telefono', 'phone', 'tel'],
}

const MAX_ROWS = 200

function detectSeparator(firstLine: string): ',' | ';' {
  const commas = (firstLine.match(/,/g) ?? []).length
  const semicolons = (firstLine.match(/;/g) ?? []).length
  return semicolons > commas ? ';' : ','
}

function parseLine(line: string, sep: string): string[] {
  const result: string[] = []
  let inQuotes = false
  let current = ''
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === sep && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

export function parseCsv(text: string): { rows: CsvRow[]; errors: string[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) {
    return { rows: [], errors: ['El CSV debe tener cabecera y al menos una fila de datos.'] }
  }

  const sep = detectSeparator(lines[0])
  const rawHeaders = parseLine(lines[0], sep).map((h) => h.toLowerCase().replace(/\s+/g, ''))

  // Map raw header positions to CsvRow fields
  const fieldMap: Record<number, keyof CsvRow> = {}
  for (const [field, aliases] of Object.entries(CSV_HEADERS) as [keyof CsvRow, string[]][]) {
    for (let i = 0; i < rawHeaders.length; i++) {
      if (aliases.includes(rawHeaders[i])) {
        fieldMap[i] = field
        break
      }
    }
  }

  if (!Object.values(fieldMap).includes('name')) {
    return {
      rows: [],
      errors: [
        'No se encontró la columna de nombre. Usa "nombre", "name", "negocio" o "empresa" como cabecera.',
      ],
    }
  }

  const rows: CsvRow[] = []
  const errors: string[] = []
  const dataLines = lines.slice(1)

  for (let i = 0; i < dataLines.length; i++) {
    const rowNumber = i + 2 // 1-indexed, counting header
    const cells = parseLine(dataLines[i], sep)

    if (i >= MAX_ROWS) {
      errors.push(`Fila ${rowNumber}: el CSV supera el límite de ${MAX_ROWS} filas. Esta fila se omite.`)
      continue
    }

    const raw: Record<string, string> = {}
    for (const [colIdx, field] of Object.entries(fieldMap)) {
      raw[field] = cells[Number(colIdx)] ?? ''
    }

    // Clean empty strings to undefined
    const cleaned: Record<string, string | undefined> = {}
    for (const [k, v] of Object.entries(raw)) {
      cleaned[k] = v.trim() || undefined
    }

    const parsed = csvRowSchema.safeParse(cleaned)
    if (!parsed.success) {
      const msgs = parsed.error.issues.map((e) => e.message).join(', ')
      errors.push(`Fila ${rowNumber}: ${msgs}`)
    } else {
      rows.push(parsed.data)
    }
  }

  return { rows, errors }
}
