'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { ProspectWithBusiness } from '@/lib/kanban/utils'

interface KanbanCardProps {
  prospect: ProspectWithBusiness
  isDragging?: boolean
}

export default function KanbanCard({ prospect, isDragging = false }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: prospect.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`rounded-lg border bg-white p-3 shadow-sm transition-shadow select-none ${
        isDragging ? 'opacity-50' : 'cursor-grab hover:shadow-md active:cursor-grabbing'
      }`}
    >
      <p className="font-medium text-sm text-zinc-900 truncate">{prospect.business.name}</p>
      {prospect.business.address && (
        <p className="text-xs text-zinc-500 truncate mt-0.5">{prospect.business.address}</p>
      )}
      <div className="flex flex-wrap gap-2 mt-2">
        {prospect.business.website && (
          <a
            href={prospect.business.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-blue-600 hover:underline truncate max-w-[130px]"
          >
            {prospect.business.website.replace(/^https?:\/\//, '')}
          </a>
        )}
        {prospect.business.phone && (
          <span className="text-xs text-zinc-500">{prospect.business.phone}</span>
        )}
      </div>
      {prospect.notes && (
        <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{prospect.notes}</p>
      )}
    </div>
  )
}
