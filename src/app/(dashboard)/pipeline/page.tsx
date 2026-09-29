import { Badge } from '@/components/ui/badge'

export default function PipelinePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-zinc-900">Pipeline</h1>
        <Badge variant="secondary">Fase 7</Badge>
      </div>
      <p className="text-zinc-600">
        Kanban de seguimiento: Nuevo → Contactado → Respondió → Reunión → Ganado / Perdido.
      </p>
      <p className="text-sm text-zinc-400">En desarrollo — disponible en la Fase 7.</p>
    </div>
  )
}
