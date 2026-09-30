import type { ProspectStatus } from '@/types/database'

export interface ProspectWithBusiness {
  id: string
  status: ProspectStatus
  notes: string | null
  next_contact_at: string | null
  contacted_at: string | null
  created_at: string
  business: {
    id: string
    name: string
    address: string | null
    website: string | null
    phone: string | null
  }
}

export const ALL_STATUSES: ProspectStatus[] = [
  'nuevo',
  'contactado',
  'respondio',
  'reunion',
  'ganado',
  'perdido',
]

export type KanbanGroups = Record<ProspectStatus, ProspectWithBusiness[]>

export function groupByStatus(prospects: ProspectWithBusiness[]): KanbanGroups {
  const groups = Object.fromEntries(
    ALL_STATUSES.map((s) => [s, [] as ProspectWithBusiness[]])
  ) as KanbanGroups

  for (const p of prospects) {
    if (groups[p.status]) {
      groups[p.status].push(p)
    }
  }

  return groups
}

export function moveProspect(
  groups: KanbanGroups,
  prospectId: string,
  toStatus: ProspectStatus
): KanbanGroups {
  let moved: ProspectWithBusiness | undefined

  const next = Object.fromEntries(
    ALL_STATUSES.map((s) => [
      s,
      groups[s].filter((p) => {
        if (p.id === prospectId) {
          moved = p
          return false
        }
        return true
      }),
    ])
  ) as KanbanGroups

  if (moved) {
    next[toStatus] = [...next[toStatus], { ...moved, status: toStatus }]
  }

  return next
}
