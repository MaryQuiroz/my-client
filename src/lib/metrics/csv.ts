export interface CsvRow {
  name: string
  address: string | null
  phone: string | null
  website: string | null
  status: string
  notes: string | null
  created_at: string
}

const HEADER = ['Nombre', 'Dirección', 'Teléfono', 'Web', 'Estado', 'Notas', 'Creado']

function escapeField(value: string | null): string {
  const str = value ?? ''
  const escaped = str.replace(/"/g, '""')
  return `"${escaped}"`
}

export function buildProspectsCsv(rows: CsvRow[]): string {
  const lines: string[] = [HEADER.map(escapeField).join(',')]

  for (const row of rows) {
    lines.push(
      [
        escapeField(row.name),
        escapeField(row.address),
        escapeField(row.phone),
        escapeField(row.website),
        escapeField(row.status),
        escapeField(row.notes),
        escapeField(row.created_at),
      ].join(',')
    )
  }

  return lines.join('\r\n')
}
