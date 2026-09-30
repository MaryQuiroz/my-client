import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin/guard'

const NAV_ITEMS = [
  { href: '/admin', label: 'Resumen' },
  { href: '/admin/users', label: 'Usuarios' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  await requireAdmin(user.id, admin)

  return (
    <div className="flex min-h-screen">
      <aside className="w-48 shrink-0 border-r border-zinc-200 bg-white flex flex-col">
        <div className="px-4 py-5 border-b border-zinc-100">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Admin
          </span>
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
          <Link href="/dashboard" className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
            ← Volver a la app
          </Link>
        </div>
      </aside>

      <main className="flex-1 bg-zinc-50 overflow-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
