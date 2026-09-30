import Link from 'next/link'

const FEATURES = [
  {
    title: 'Encuentra clientes con problemas reales',
    description:
      'Busca negocios locales por sector y zona. Detecta automáticamente webs lentas, sin SSL, sin móvil o sin presencia digital. Solo oportunidades medibles.',
  },
  {
    title: 'Genera auditorías PDF en segundos',
    description:
      'Informes profesionales con datos objetivos de PageSpeed, accesibilidad y SEO básico. Envíalos directamente al prospecto para abrir la conversación.',
  },
  {
    title: 'Gestiona tu pipeline hasta el cierre',
    description:
      'Kanban visual para mover prospectos de "nuevo" a "ganado". Mensajes de prospección generados con IA adaptados a tu tono y servicio.',
  },
]

const PLANS = [
  {
    name: 'Gratuito',
    price: '0 €',
    features: ['5 búsquedas / mes', '2 auditorías PDF / mes', '5 mensajes IA / mes'],
    cta: 'Empezar gratis',
    href: '/registro',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 'Próximamente',
    features: ['50 búsquedas / mes', '20 auditorías PDF / mes', '50 mensajes IA / mes'],
    cta: 'Unirme a la lista',
    href: '/registro',
    highlighted: true,
  },
  {
    name: 'Agencia',
    price: 'Próximamente',
    features: ['200 búsquedas / mes', '100 auditorías PDF / mes', '200 mensajes IA / mes'],
    cta: 'Unirme a la lista',
    href: '/registro',
    highlighted: false,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="border-b border-zinc-100">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <span className="text-base font-semibold text-zinc-900">My Client</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
              Entrar
            </Link>
            <Link
              href="/registro"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
            >
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 py-24 text-center">
          <p className="text-sm font-medium text-blue-600 mb-4 uppercase tracking-wide">
            Para freelancers y agencias en España
          </p>
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 leading-tight mb-6">
            Vende más webs.<br />Con datos, no con suposiciones.
          </h1>
          <p className="text-xl text-zinc-500 max-w-2xl mx-auto mb-10">
            Encuentra negocios locales con problemas web medibles, genera auditorías
            profesionales en segundos y gestiona tu prospección hasta el cierre.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/registro"
              className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-8 py-3.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
            >
              Empezar gratis — sin tarjeta
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-200 px-8 py-3.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="bg-zinc-50 border-y border-zinc-100">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <h2 className="text-2xl font-bold text-zinc-900 text-center mb-12">
              Todo lo que necesitas para prospeccionar con rigor
            </h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {FEATURES.map((f) => (
                <div key={f.title} className="space-y-3">
                  <h3 className="font-semibold text-zinc-900">{f.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-2xl font-bold text-zinc-900 text-center mb-3">Planes</h2>
          <p className="text-zinc-500 text-center mb-12 text-sm">
            Empieza gratis. Escala cuando lo necesites.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-6 space-y-6 ${
                  plan.highlighted
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-200 bg-white'
                }`}
              >
                <div>
                  <p className={`text-sm font-medium mb-1 ${plan.highlighted ? 'text-zinc-300' : 'text-zinc-500'}`}>
                    {plan.name}
                  </p>
                  <p className={`text-2xl font-bold ${plan.highlighted ? 'text-white' : 'text-zinc-900'}`}>
                    {plan.price}
                  </p>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className={`text-sm flex items-center gap-2 ${plan.highlighted ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      <span className={plan.highlighted ? 'text-zinc-400' : 'text-zinc-400'}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block text-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    plan.highlighted
                      ? 'bg-white text-zinc-900 hover:bg-zinc-100'
                      : 'border border-zinc-200 text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          {/* TODO-LEGAL: Precios definitivos e IVA pendientes de revisión antes de activar Stripe en modo live */}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100">
        <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-400">© {new Date().getFullYear()} My Client. Hecho en España.</p>
          <nav className="flex gap-5">
            {[
              { href: '/legal/privacidad', label: 'Privacidad' },
              { href: '/legal/aviso-legal', label: 'Aviso legal' },
              { href: '/legal/cookies', label: 'Cookies' },
              { href: '/legal/terminos', label: 'Términos' },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}
