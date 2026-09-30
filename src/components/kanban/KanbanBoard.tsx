'use client'

import { useState } from 'react'
import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import type { ProspectStatus } from '@/types/database'
import {
  groupByStatus,
  moveProspect,
  ALL_STATUSES,
  type ProspectWithBusiness,
  type KanbanGroups,
} from '@/lib/kanban/utils'
import KanbanColumn from './KanbanColumn'
import KanbanCard from './KanbanCard'

interface ColumnConfig {
  status: ProspectStatus
  label: string
  color: string
}

const COLUMNS: ColumnConfig[] = [
  { status: 'nuevo', label: 'Nuevo', color: 'border-blue-400' },
  { status: 'contactado', label: 'Contactado', color: 'border-yellow-400' },
  { status: 'respondio', label: 'Respondió', color: 'border-orange-400' },
  { status: 'reunion', label: 'Reunión', color: 'border-violet-400' },
  { status: 'ganado', label: 'Ganado', color: 'border-green-500' },
  { status: 'perdido', label: 'Perdido', color: 'border-red-400' },
]

interface KanbanBoardProps {
  initialProspects: ProspectWithBusiness[]
}

export default function KanbanBoard({ initialProspects }: KanbanBoardProps) {
  const [groups, setGroups] = useState<KanbanGroups>(() =>
    groupByStatus(initialProspects)
  )
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [prevGroups, setPrevGroups] = useState<KanbanGroups | null>(null)

  const draggingProspect = draggingId
    ? ALL_STATUSES.flatMap((s) => groups[s]).find((p) => p.id === draggingId) ?? null
    : null

  function handleDragStart({ active }: DragStartEvent) {
    setDraggingId(String(active.id))
    setPrevGroups(groups)
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setDraggingId(null)

    if (!over) return

    const prospectId = String(active.id)
    const toStatus = String(over.id) as ProspectStatus

    if (!ALL_STATUSES.includes(toStatus)) return

    // Optimistic update
    const updated = moveProspect(groups, prospectId, toStatus)
    setGroups(updated)

    try {
      const res = await fetch(`/api/prospects/${prospectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: toStatus }),
      })
      if (!res.ok) throw new Error('PATCH failed')
    } catch {
      // Revertir al estado previo
      if (prevGroups) setGroups(prevGroups)
    }

    setPrevGroups(null)
  }

  function handleDragCancel() {
    setDraggingId(null)
    if (prevGroups) setGroups(prevGroups)
    setPrevGroups(null)
  }

  const total = ALL_STATUSES.reduce((sum, s) => sum + groups[s].length, 0)

  return (
    <div>
      <p className="text-sm text-zinc-500 mb-4">
        {total} {total === 1 ? 'prospecto' : 'prospectos'} en total
      </p>
      <div className="overflow-x-auto pb-4">
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex gap-3 min-w-max">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.status}
                status={col.status}
                label={col.label}
                color={col.color}
                prospects={groups[col.status]}
                draggingId={draggingId}
              />
            ))}
          </div>

          <DragOverlay>
            {draggingProspect ? (
              <div className="rotate-1 opacity-95">
                <KanbanCard prospect={draggingProspect} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
