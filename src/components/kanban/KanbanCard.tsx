'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { ProspectWithBusiness } from '@/lib/kanban/utils'

interface KanbanCardProps {
  prospect: ProspectWithBusiness
  isDragging?: boolean
  onOpenDetail?: (prospect: ProspectWithBusiness) => void
}

export default function KanbanCard({
  prospect,
  isDragging = false,
  onOpenDetail,
}: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: prospect.id,
  })

  const style = { transform: CSS.Translate.toString(transform) }

  const isOverdue =
    prospect.next_contact_at && new Date(prospect.next_contact_at) < new Date()

  const nextContactLabel = prospect.next_contact_at
    ? new Date(prospect.next_contact_at).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      })
    : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border bg-white shadow-sm transition-shadow select-none ${
        isDragging ? 'opacity-50' : 'hover:shadow-md'
      }`}
    >
      {/* Zona arrastrable */}
      <div
        {...listeners}
        {...attributes}
        className={`p-3 ${isDragging ? '' : 'cursor-grab active:cursor-grabbing'}`}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm text-zinc-900 truncate flex-1">
            {prospect.business.name}
          </p>
          {/* Botón de detalle — detiene propagación del drag */}
          {onOpenDetail && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                onOpenDetail(prospect)
              }}
              className="shrink-0 rounded p-0.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
              title="Ver detalle"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>
          )}
        </div>

        {prospect.business.address && (
          <p className="text-xs text-zinc-500 truncate mt-0.5">{prospect.business.address}</p>
        )}

        <div className="flex flex-wrap gap-2 mt-2">
          {prospect.business.website && (
            <a
              href={prospect.business.website}
              target="_blank"
              rel="noopener noreferrer"
              onPointerDown={(e) => e.stopPropagation()}
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

        {nextContactLabel && (
          <div
            className={`mt-2 flex items-center gap-1 text-xs font-medium ${
              isOverdue ? 'text-red-600' : 'text-zinc-500'
            }`}
          >
            <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {isOverdue ? 'Vencido: ' : ''}{nextContactLabel}
          </div>
        )}
      </div>
    </div>
  )
}
