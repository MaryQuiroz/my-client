# My Client

App web SaaS de prospección B2B para freelancers y agencias que venden páginas web a negocios locales. Ayuda a encontrar negocios con problemas web medibles, generar auditorías objetivas, redactar mensajes personalizados y gestionar el seguimiento hasta la venta.

## Stack

- **Framework**: Next.js 16 (App Router) + TypeScript estricto
- **Estilos**: Tailwind CSS v4 + shadcn/ui
- **Base de datos**: Supabase (PostgreSQL + Auth + RLS)
- **Validación**: Zod (cliente y servidor)
- **Mapas**: react-leaflet + OpenStreetMap
- **Kanban**: dnd-kit
- **IA**: SDK de Anthropic (solo servidor)
- **Pagos**: Stripe (suscripciones + webhooks)
- **PDF**: @react-pdf/renderer (solo servidor)
- **Tests**: Vitest + Playwright
- **Despliegue**: Vercel + GitHub Actions

## Instalación

```bash
# 1. Clona el repositorio
git clone <url-del-repo>
cd my-client

# 2. Instala las dependencias
npm install

# 3. Copia y rellena las variables de entorno
cp .env.example .env.local
# Edita .env.local con tus claves (ver comentarios en .env.example)

# 4. Arranca el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | Comprobación de tipos TypeScript |
| `npm run test` | Tests unitarios (Vitest) |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:coverage` | Tests con cobertura |
| `npm run test:e2e` | Tests end-to-end (Playwright) |
| `npm run verify` | lint + typecheck + test + build (obligatorio antes de cada PR) |

## Variables de entorno

Copia `.env.example` a `.env.local` y rellena los valores. Consulta `.env.example` para la descripción de cada variable y en qué fase del roadmap se necesita.

**Nunca subas `.env.local` ni ningún archivo `.env` con valores reales al repositorio.**

## Estructura del proyecto

```
src/
├── app/              # Next.js App Router (páginas y API routes)
├── components/       # Componentes React (ui/, map/, kanban/, audit/, shared/)
├── lib/              # Lógica de negocio (places/, scoring/, messages/, audit/, stripe/, supabase/)
├── types/            # Tipos TypeScript globales
└── hooks/            # Custom React hooks
supabase/migrations/  # Migraciones SQL numeradas
tests/unit/           # Tests unitarios (Vitest)
tests/e2e/            # Tests e2e (Playwright)
fixtures/             # Datos de prueba genéricos
```

## Roadmap

Ver [ROADMAP.md](./ROADMAP.md) para el detalle de cada fase de desarrollo.

## Cumplimiento legal

- Solo se recogen los datos estrictamente necesarios de negocios y contactos.
- Los mensajes generados incluyen opción de baja/opt-out (requerido por LSSI).
- Sin scraping: solo APIs oficiales.
- TODO-LEGAL marca los puntos que requieren revisión por un abogado antes del lanzamiento.

## Contribución

Ver [CLAUDE.md](./CLAUDE.md) para las convenciones de código, flujo de Git y checklist de seguridad.
