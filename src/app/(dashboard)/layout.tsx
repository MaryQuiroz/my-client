import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PostHogProvider } from '@/components/analytics/PostHogProvider'
import { NavLink } from '@/components/layout/NavLink'
import { MobileSidebar } from '@/components/layout/MobileSidebar'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Cuadrante' },
  { href: '/prospecting', label: 'Prospección' },
  { href: '/pipeline', label: 'Pipeline' },
  { href: '/mapa', label: 'Mapa' },
  { href: '/metrics', label: 'Métricas' },
  { href: '/herramientas', label: 'Herramientas' },
  { href: '/profile', label: 'Mi perfil' },
  { href: '/upgrade', label: 'Planes' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <PostHogProvider userId={user.id} userEmail={user.email}>
      <div className="min-h-screen flex flex-col">
        <MobileSidebar userEmail={user.email} />
        <div className="flex flex-1">
          {/* Sidebar desktop */}
          <aside className="hidden md:flex w-56 shrink-0 border-r border-zinc-200 bg-white flex-col">
            <div className="px-4 py-5 border-b border-zinc-100">
              <span className="text-base font-semibold text-zinc-900">My Client</span>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.href} href={item.href} label={item.label} />
              ))}
            </nav>
            <div className="px-4 py-4 border-t border-zinc-100">
              <p className="text-xs text-zinc-400 truncate">{user.email}</p>
              <LogoutButton />
            </div>
          </aside>

          {/* Contenido principal */}
          <main className="flex-1 bg-zinc-50 overflow-auto">
            <div className="mx-auto max-w-5xl px-4 md:px-6 py-6 md:py-8">{children}</div>
          </main>
        </div>
      </div>
    </PostHogProvider>
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
