import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { PostHogProvider } from '@/components/analytics/PostHogProvider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://myclient.app'

export const metadata: Metadata = {
  title: {
    default: 'My Client — Prospección web para freelancers y agencias',
    template: '%s — My Client',
  },
  description:
    'Encuentra negocios locales con problemas web, genera auditorías objetivas y gestiona tu seguimiento hasta la venta. Para freelancers y agencias en España.',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: BASE_URL,
    siteName: 'My Client',
    title: 'My Client — Prospección web para freelancers y agencias',
    description:
      'Encuentra negocios locales con problemas web, genera auditorías objetivas y gestiona tu seguimiento hasta la venta.',
  },
  twitter: {
    card: 'summary',
    title: 'My Client — Prospección web para freelancers y agencias',
    description:
      'Encuentra negocios locales con problemas web, genera auditorías objetivas y gestiona tu seguimiento hasta la venta.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: BASE_URL,
  },
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
