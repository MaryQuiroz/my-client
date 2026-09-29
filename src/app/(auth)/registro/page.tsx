import { redirect } from 'next/navigation'

// El magic link de Supabase sirve tanto para registro como para login.
// Redirigimos a /login para simplificar el flujo.
export default function RegistroPage() {
  redirect('/login')
}
