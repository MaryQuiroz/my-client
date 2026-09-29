import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const QUADRANTS = [
  {
    id: 'C1',
    title: 'Contenido orgánico',
    description: 'Atrae clientes con artículos, vídeos y SEO sin coste por clic.',
    available: false,
  },
  {
    id: 'C2',
    title: 'Publicidad y embudo',
    description: 'Capta clientes con anuncios de pago y un embudo automatizado.',
    available: false,
  },
  {
    id: 'C3',
    title: 'Prospección manual',
    description:
      'Encuentra negocios locales con problemas web, genera auditorías y envía mensajes personalizados.',
    href: '/prospecting',
    available: true,
  },
  {
    id: 'C4',
    title: 'Captación a escala',
    description: 'Automatiza la búsqueda y el contacto con cientos de negocios a la vez.',
    available: false,
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Cuadrante de captación</h1>
        <p className="mt-1 text-zinc-600">
          Elige cómo quieres conseguir nuevos clientes. Ahora mismo está activa la prospección
          manual (C3).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {QUADRANTS.map((q) => (
          <Card
            key={q.id}
            className={q.available ? 'border-zinc-900' : 'opacity-60'}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-400">{q.id}</span>
                <CardTitle className="text-base">{q.title}</CardTitle>
                {!q.available && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Próximamente
                  </Badge>
                )}
              </div>
              <CardDescription>{q.description}</CardDescription>
            </CardHeader>
            {q.available && q.href && (
              <CardContent>
                <Link
                  href={q.href}
                  className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
                >
                  Ir a prospección →
                </Link>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
