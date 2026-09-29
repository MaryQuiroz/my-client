import { Badge } from '@/components/ui/badge'

export default function MetricsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-zinc-900">Métricas</h1>
        <Badge variant="secondary">Fase 8</Badge>
      </div>
      <p className="text-zinc-600">
        Mensajes enviados, respuestas, auditorías, reuniones, ventas y coste por reunión.
      </p>
      <p className="text-sm text-zinc-400">En desarrollo — disponible en la Fase 8.</p>
    </div>
  )
}
