import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium text-zinc-400 mb-2">404</p>
      <h1 className="text-2xl font-bold text-zinc-900 mb-3">Página no encontrada</h1>
      <p className="text-zinc-500 text-sm mb-8">
        La página que buscas no existe o ha sido movida.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
