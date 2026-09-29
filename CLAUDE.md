# CLAUDE.md — My Client

## Producto
App SaaS B2B para freelancers y agencias que venden webs a negocios locales. Ayuda a encontrar negocios con problemas web medibles, generar auditorías objetivas y gestionar el seguimiento hasta la venta. Mercado: España (LSSI/RGPD).

## Stack
Next.js 16 App Router · TypeScript estricto · Tailwind v4 · shadcn/ui · Supabase (Auth + PostgreSQL + RLS) · Zod · react-leaflet · dnd-kit · Anthropic SDK · Stripe · @react-pdf/renderer · Vitest · Playwright · Vercel

## Comandos
```bash
npm run dev          # desarrollo
npm run lint         # ESLint (debe pasar)
npm run typecheck    # tsc --noEmit (debe pasar)
npm run test         # Vitest unit tests (deben pasar)
npm run test:e2e     # Playwright e2e
npm run verify       # lint + typecheck + test + build — OBLIGATORIO antes de cada commit
```

## Estructura de carpetas
```
src/app/              # páginas y API routes (App Router)
src/components/       # componentes React (sin lógica de negocio)
src/lib/              # lógica de negocio pura
  places/             # interfaz PlacesProvider + implementaciones
  scoring/            # cálculo de puntuación y config de señales
  messages/           # generación de mensajes con Anthropic
  audit/              # generación de PDF
  stripe/             # billing, planes y webhooks
  supabase/           # clientes browser, server y admin
  validations/        # schemas Zod compartidos
src/types/            # tipos TypeScript globales
src/hooks/            # custom React hooks
supabase/migrations/  # SQL numeradas (001_, 002_...)
tests/unit/           # Vitest
tests/e2e/            # Playwright
fixtures/             # datos de prueba genéricos
```

## Convenciones de código
- TypeScript sin `any`. Usa `unknown` y estrecha el tipo.
- Zod en cliente Y servidor para toda entrada externa.
- Lógica de negocio en `src/lib/`, nunca dentro de componentes.
- APIs externas solo desde servidor (Route Handlers o Server Actions).
- Ningún servicio, sector, zona ni mensaje hardcodeado: siempre viene del usuario.
- Toda lógica de negocio detrás de `PlacesProvider` (`src/lib/places/types.ts`).
- Pesos de señales solo en `src/lib/scoring/config.ts`.
- Límites de plan solo en `src/lib/stripe/config.ts`.

## Git
- Ramas: `feat/`, `fix/`, `chore/`, `docs/`, `test/` + descripción corta
- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`
- **Nunca push directo a `main`**. Solo PR con CI en verde.
- Squash merge en todos los PR.

## Seguridad
- Nunca leer, mostrar ni loguear el contenido de `.env*`.
- Toda variable nueva → añadir primero a `.env.example` con comentario.
- RLS obligatoria en toda tabla con datos de usuario. Sin excepciones.
- Claves de Stripe y service role de Supabase solo en servidor.
- Webhooks de Stripe verificados con firma (`stripe.webhooks.constructEvent`).
- Rate limiting en todas las rutas de API.

## Cumplimiento
- Solo los datos estrictamente necesarios de negocios y contactos.
- Mensajes con opción de baja. Prohibido el envío automático en el MVP.
- Sin scraping. Solo APIs oficiales.
- Marcar con `TODO-LEGAL` todo lo que requiera revisión de abogado:
  email en frío (LSSI/RGPD), TOS Google Maps Platform, facturación e IVA.
- Política de privacidad, aviso legal, cookies y términos antes de lanzar (Fase 13).

## Testing obligatorio
Cualquier cambio en estas áreas requiere tests:
- Scoring (`src/lib/scoring/`)
- Validaciones Zod
- Generación de mensajes (honestidad, sin datos inventados)
- Límites de plan y cuotas
- Webhooks de Stripe (idempotencia)
- Políticas RLS (tests de integración con Supabase)
- Kanban y drag-and-drop

## Forma de trabajar
1. Plan antes de programar → esperar aprobación del usuario.
2. Cambios pequeños y enfocados. Un PR por tema.
3. Tests con cada cambio de lógica de negocio.
4. Si algo es ambiguo, preguntar antes de implementar.
5. Al terminar, indicar qué revisar manualmente (variables, migraciones, claves).

## Lecciones aprendidas
<!-- Añadir aquí tras cada fase completada -->
