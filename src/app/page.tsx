import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center min-h-screen bg-zinc-50 px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">My Client</h1>
          <p className="text-lg text-zinc-600">
            Encuentra negocios locales con problemas web, genera auditorías objetivas y gestiona tu
            seguimiento hasta la venta.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/registro"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition-colors"
          >
            Crear cuenta
          </Link>
        </div>

        <p className="text-xs text-zinc-400">
          Para freelancers y agencias que venden webs a negocios locales.
        </p>
      </div>
    </main>
  )
}
