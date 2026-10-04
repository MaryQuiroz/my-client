import { describe, it, expect } from 'vitest'
import { parseCsv } from '@/lib/validations/csv-import'

describe('parseCsv', () => {
  it('parses CSV with comma separator', () => {
    const csv = 'nombre,web,sector,ciudad,telefono\nRestaurante Prueba,https://prueba.com,Restaurante,Madrid,600000001'
    const { rows, errors } = parseCsv(csv)
    expect(errors).toHaveLength(0)
    expect(rows).toHaveLength(1)
    expect(rows[0].name).toBe('Restaurante Prueba')
    expect(rows[0].website).toBe('https://prueba.com')
    expect(rows[0].city).toBe('Madrid')
  })

  it('parses CSV with semicolon separator', () => {
    const csv = 'nombre;web;sector;ciudad;telefono\nPeluquería Sol;https://sol.es;Peluquería;Barcelona;611222333'
    const { rows, errors } = parseCsv(csv)
    expect(errors).toHaveLength(0)
    expect(rows).toHaveLength(1)
    expect(rows[0].name).toBe('Peluquería Sol')
    expect(rows[0].city).toBe('Barcelona')
  })

  it('returns error for row without name', () => {
    const csv = 'nombre,ciudad\n,Madrid'
    const { rows, errors } = parseCsv(csv)
    expect(rows).toHaveLength(0)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0]).toContain('Fila 2')
  })

  it('maps Spanish header "nombre" correctly', () => {
    const csv = 'nombre,ciudad\nFontanero García,Valencia'
    const { rows, errors } = parseCsv(csv)
    expect(errors).toHaveLength(0)
    expect(rows[0].name).toBe('Fontanero García')
    expect(rows[0].city).toBe('Valencia')
  })

  it('limits to 200 rows and reports extras as errors', () => {
    const header = 'nombre,ciudad'
    const dataLines = Array.from({ length: 201 }, (_, i) => `Negocio ${i + 1},Madrid`)
    const csv = [header, ...dataLines].join('\n')
    const { rows, errors } = parseCsv(csv)
    expect(rows).toHaveLength(200)
    expect(errors.length).toBeGreaterThanOrEqual(1)
    expect(errors.some((e) => e.includes('límite'))).toBe(true)
  })

  it('returns error when name column is missing', () => {
    const csv = 'ciudad,telefono\nMadrid,600000000'
    const { rows, errors } = parseCsv(csv)
    expect(rows).toHaveLength(0)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0]).toContain('nombre')
  })

  it('skips invalid rows but keeps valid ones', () => {
    const csv = 'nombre,ciudad\nN,Madrid\nNegocio Válido,Sevilla'
    const { rows, errors } = parseCsv(csv)
    expect(rows).toHaveLength(1)
    expect(rows[0].name).toBe('Negocio Válido')
    expect(errors).toHaveLength(1)
  })
})
