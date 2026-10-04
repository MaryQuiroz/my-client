'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegistroPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear cuenta en My Client</CardTitle>
        <CardDescription>
          No necesitas contraseña. Te enviamos un enlace mágico a tu email.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-zinc-600">
          El registro y el acceso funcionan igual: introduce tu email y recibirás un enlace para
          entrar directamente.
        </p>
        <Link
          href="/login"
          className="block w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          Continuar con email
        </Link>
        <p className="text-center text-xs text-zinc-400">
          Al crear una cuenta aceptas los{' '}
          <Link href="/legal/terminos" className="underline hover:text-zinc-600">
            Términos
          </Link>{' '}
          y la{' '}
          <Link href="/legal/privacidad" className="underline hover:text-zinc-600">
            Política de privacidad
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  )
}
