import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { PostHogProvider } from '@/components/analytics/PostHogProvider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'My Client — Prospección B2B para freelancers y agencias',
  description:
    'Encuentra negocios locales con problemas web, genera auditorías objetivas y gestiona tu seguimiento hasta la venta.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
          <PostHogProvider>{children}</PostHogProvider>
        </body>
    </html>
  )
}
