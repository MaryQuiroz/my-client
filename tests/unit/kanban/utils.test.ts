import { describe, it, expect } from 'vitest'
import {
  groupByStatus,
  moveProspect,
  ALL_STATUSES,
  type ProspectWithBusiness,
} from '@/lib/kanban/utils'

function makeProspect(
  id: string,
  status: ProspectWithBusiness['status'],
  businessName = 'Negocio Test'
): ProspectWithBusiness {
  return {
    id,
    status,
    notes: null,
    next_contact_at: null,
    contacted_at: null,
    created_at: new Date().toISOString(),
    business: { id: 'b1', name: businessName, address: null, website: null, phone: null },
  }
}

describe('groupByStatus', () => {
  it('agrupa correctamente por status', () => {
    const prospects = [
      makeProspect('p1', 'nuevo'),
      makeProspect('p2', 'nuevo'),
      makeProspect('p3', 'ganado'),
    ]
    const groups = groupByStatus(prospects)
    expect(groups.nuevo).toHaveLength(2)
    expect(groups.ganado).toHaveLength(1)
  })

  it('con array vacío devuelve todas las columnas vacías', () => {
    const groups = groupByStatus([])
    for (const status of ALL_STATUSES) {
      expect(groups[status]).toEqual([])
    }
  })

  it('incluye las 6 columnas aunque algunas estén vacías', () => {
    const groups = groupByStatus([makeProspect('p1', 'nuevo')])
    expect(Object.keys(groups)).toHaveLength(6)
    for (const status of ALL_STATUSES) {
      expect(groups[status]).toBeDefined()
    }
  })

  it('preserva todos los campos del prospecto', () => {
    const p = makeProspect('p1', 'contactado', 'Cafetería López')
    const groups = groupByStatus([p])
    expect(groups.contactado[0].business.name).toBe('Cafetería López')
    expect(groups.contactado[0].id).toBe('p1')
  })
})

describe('moveProspect', () => {
  it('mueve la tarjeta a la columna destino', () => {
    const groups = groupByStatus([makeProspect('p1', 'nuevo')])
    const next = moveProspect(groups, 'p1', 'contactado')
    expect(next.contactado).toHaveLength(1)
    expect(next.contactado[0].id).toBe('p1')
  })

  it('elimina la tarjeta de la columna origen', () => {
    const groups = groupByStatus([makeProspect('p1', 'nuevo')])
    const next = moveProspect(groups, 'p1', 'contactado')
    expect(next.nuevo).toHaveLength(0)
  })

  it('mover a la misma columna no duplica la tarjeta', () => {
    const groups = groupByStatus([makeProspect('p1', 'nuevo')])
    const next = moveProspect(groups, 'p1', 'nuevo')
    expect(next.nuevo).toHaveLength(1)
  })

  it('actualiza el status del prospecto movido', () => {
    const groups = groupByStatus([makeProspect('p1', 'nuevo')])
    const next = moveProspect(groups, 'p1', 'reunion')
    expect(next.reunion[0].status).toBe('reunion')
  })

  it('ID inexistente no lanza excepción y no modifica el estado', () => {
    const groups = groupByStatus([makeProspect('p1', 'nuevo')])
    expect(() => moveProspect(groups, 'inexistente', 'ganado')).not.toThrow()
    const next = moveProspect(groups, 'inexistente', 'ganado')
    expect(next.nuevo).toHaveLength(1)
    expect(next.ganado).toHaveLength(0)
  })
})
