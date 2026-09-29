import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Cuadrante' },
  { href: '/prospecting', label: 'Prospección' },
  { href: '/pipeline', label: 'Pipeline' },
  { href: '/metrics', label: 'Métricas' },
  { href: '/profile', label: 'Mi perfil' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-zinc-200 bg-white flex flex-col">
        <div className="px-4 py-5 border-b border-zinc-100">
          <span className="text-base font-semibold text-zinc-900">My Client</span>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-zinc-100">
          <p className="text-xs text-zinc-400 truncate">{user.email}</p>
          <LogoutButton />
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 bg-zinc-50 overflow-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
      </main>
    </div>
  )
}

function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button
        type="submit"
        className="mt-2 text-xs text-zinc-500 hover:text-zinc-900 underline"
      >
        Cerrar sesión
      </button>
    </form>
  )
}
