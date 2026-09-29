import { Badge } from '@/components/ui/badge'

export default function ProspectingPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-zinc-900">Prospección manual</h1>
        <Badge variant="secondary">Fase 3</Badge>
      </div>
      <p className="text-zinc-600">
        Aquí podrás buscar negocios locales por tipo y zona, ver sus señales de mejora web en un
        mapa y lista, y generar auditorías y mensajes personalizados.
      </p>
      <p className="text-sm text-zinc-400">En desarrollo — disponible en la Fase 3.</p>
    </div>
  )
}
