import { describe, it, expect } from 'vitest'
import { buildProspectsCsv, type CsvRow } from '@/lib/metrics/csv'

function makeRow(overrides: Partial<CsvRow> = {}): CsvRow {
  return {
    name: 'Negocio Test',
    address: 'Calle Mayor 1',
    phone: '+34 600 000 000',
    website: 'https://ejemplo.com',
    status: 'nuevo',
    notes: null,
    created_at: '2026-09-30T10:00:00.000Z',
    ...overrides,
  }
}

describe('buildProspectsCsv', () => {
  it('array vacío → solo la línea de cabecera', () => {
    const csv = buildProspectsCsv([])
    const lines = csv.split('\r\n')
    expect(lines).toHaveLength(1)
    expect(lines[0]).toContain('Nombre')
  })

  it('un registro → cabecera + 1 línea de datos', () => {
    const csv = buildProspectsCsv([makeRow()])
    const lines = csv.split('\r\n')
    expect(lines).toHaveLength(2)
  })

  it('varios registros → número correcto de líneas', () => {
    const csv = buildProspectsCsv([makeRow(), makeRow(), makeRow()])
    const lines = csv.split('\r\n')
    expect(lines).toHaveLength(4) // 1 header + 3 rows
  })

  it('campo nulo → celda vacía (comillas vacías)', () => {
    const csv = buildProspectsCsv([makeRow({ notes: null, phone: null })])
    const dataLine = csv.split('\r\n')[1]
    expect(dataLine).toContain('""')
  })

  it('comillas en el campo → escapadas duplicándolas', () => {
    const csv = buildProspectsCsv([makeRow({ name: 'Bar "El Rincón"' })])
    expect(csv).toContain('"Bar ""El Rincón"""')
  })

  it('salto de línea en notas → campo entre comillas sin romper el CSV', () => {
    const csv = buildProspectsCsv([makeRow({ notes: 'Línea 1\nLínea 2' })])
    const lines = csv.split('\r\n')
    // Debe seguir habiendo solo 2 líneas (header + 1 row) aunque notes tenga \n
    expect(lines).toHaveLength(2)
    expect(lines[1]).toContain('"Línea 1\nLínea 2"')
  })

  it('el nombre del negocio aparece en los datos', () => {
    const csv = buildProspectsCsv([makeRow({ name: 'Peluquería Lucía' })])
    expect(csv).toContain('Peluquería Lucía')
  })
})
