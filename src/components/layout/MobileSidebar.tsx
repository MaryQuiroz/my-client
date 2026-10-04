'use client'
import { useState } from 'react'
import { NavLink } from './NavLink'

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

interface MobileSidebarProps {
  userEmail?: string
}

export function MobileSidebar({ userEmail }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-white">
        <span className="text-base font-semibold text-zinc-900">My Client</span>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-md text-zinc-600 hover:bg-zinc-100"
          aria-label="Menú"
        >
          {open ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative z-50 w-64 bg-white flex flex-col shadow-xl">
            <div className="px-4 py-5 border-b border-zinc-100">
              <span className="text-base font-semibold text-zinc-900">My Client</span>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1" onClick={() => setOpen(false)}>
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.href} href={item.href} label={item.label} />
              ))}
            </nav>
            <div className="px-4 py-4 border-t border-zinc-100">
              <p className="text-xs text-zinc-400 truncate">{userEmail}</p>
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="mt-2 text-xs text-zinc-500 hover:text-zinc-900 underline">
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
