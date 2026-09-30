'use client'

import { useDroppable } from '@dnd-kit/core'
import type { ProspectStatus } from '@/types/database'
import type { ProspectWithBusiness } from '@/lib/kanban/utils'
import KanbanCard from './KanbanCard'

interface KanbanColumnProps {
  status: ProspectStatus
  label: string
  color: string
  prospects: ProspectWithBusiness[]
  draggingId: string | null
}

export default function KanbanColumn({
  status,
  label,
  color,
  prospects,
  draggingId,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="flex flex-col min-w-[160px] flex-1">
      {/* Header */}
      <div className={`rounded-t-lg border-t-2 ${color} bg-white px-3 py-2 border-x border-zinc-200`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-700">{label}</span>
          <span className="text-xs text-zinc-400 tabular-nums">{prospects.length}</span>
        </div>
      </div>

      {/* Cards area */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-b-lg border border-t-0 border-zinc-200 p-2 space-y-2 min-h-[120px] transition-colors ${
          isOver ? 'bg-blue-50' : 'bg-zinc-50'
        }`}
      >
        {prospects.map((p) => (
          <KanbanCard key={p.id} prospect={p} isDragging={p.id === draggingId} />
        ))}
        {prospects.length === 0 && !isOver && (
          <p className="text-center text-xs text-zinc-300 py-4">Vacío</p>
        )}
      </div>
    </div>
  )
}
