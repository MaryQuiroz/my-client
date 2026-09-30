import Link from 'next/link'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-zinc-100">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-zinc-900">
            My Client
          </Link>
          <Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
            Acceder →
          </Link>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-3xl w-full px-6 py-12">
        {children}
      </main>

      <footer className="border-t border-zinc-100">
        <div className="mx-auto max-w-3xl px-6 py-6 flex flex-wrap gap-4 text-xs text-zinc-400">
          <Link href="/legal/privacidad" className="hover:text-zinc-600 transition-colors">Privacidad</Link>
          <Link href="/legal/aviso-legal" className="hover:text-zinc-600 transition-colors">Aviso legal</Link>
          <Link href="/legal/cookies" className="hover:text-zinc-600 transition-colors">Cookies</Link>
          <Link href="/legal/terminos" className="hover:text-zinc-600 transition-colors">Términos</Link>
        </div>
      </footer>
    </div>
  )
}
