# My Client — Documentación

SaaS B2B para freelancers y agencias que venden webs a negocios locales en España.  
Mercado: España · Cumplimiento: LSSI/RGPD · Deploy: Vercel

---

## Planes

| Plan | Precio | Búsquedas/mes | Auditorías/mes | Mensajes IA/mes |
|------|--------|---------------|----------------|-----------------|
| Gratuito | 0 € | 5 | 2 | 5 |
| Pro | 29 €/mes | 50 | 20 | 50 |
| Agencia | 79 €/mes | 200 | 100 | 200 |

---

## Stack

| Área | Tecnología |
|------|-----------|
| Framework | Next.js 16 App Router · TypeScript estricto |
| UI | Tailwind v4 · shadcn/ui · dnd-kit (Kanban drag & drop) |
| Backend | Supabase (Auth + PostgreSQL + RLS + Storage) |
| IA | Anthropic SDK — claude-haiku-4-5 para mensajes |
| Pagos | Stripe — checkout, portal y webhooks |
| PDF | @react-pdf/renderer con `renderToBuffer()` |
| Mapas | react-leaflet v5 + OpenStreetMap |
| Analítica | PostHog EU cloud |
| Testing | Vitest (121 tests) · Playwright e2e |
| Deploy | Vercel (conectado a `main`) |

> **Regla Leaflet:** siempre en Client Components con `dynamic(..., { ssr: false })` en un wrapper `'use client'`. Nunca en Server Components directamente.

---

## Comandos

```bash
npm run dev          # servidor local en :3000
npm run lint         # ESLint (debe pasar)
npm run typecheck    # tsc --noEmit (debe pasar)
npm run test         # Vitest — 121 tests
npm run test:e2e     # Playwright
npm run verify       # lint + typecheck + test + build — OBLIGATORIO antes de commit
```

### Git

```
feat/ fix/ chore/ docs/ test/          # prefijos de rama
feat: fix: chore: docs: test: refactor:  # Conventional Commits
```

Nunca push directo a `main`. Solo PR con CI en verde + squash merge.

---

## Funcionalidades implementadas

### Prospección (`/prospecting`)

| Feature | Descripción |
|---------|-------------|
| Búsqueda Google Places (New) | Busca negocios por sector y ciudad. Requiere Places API activada en GCP + billing. |
| Añadir manualmente | Sin dependencia de Google. `place_id = 'manual_' + uuid`. lat/lng = 0. |
| Importar CSV | Hasta 200 filas. Separador auto-detectado. Cabeceras en español/inglés. `place_id = 'csv_' + uuid`. |
| Puntuación de oportunidad | 7 señales. Pesos en `src/lib/scoring/config.ts`. |
| Auditoría PDF técnica | Sube a Storage `audit-pdfs`. URL firmada 1h. |
| Generador de mensajes IA | Canal: WhatsApp/email/llamada. Plantillas por 7 sectores. |

### Pipeline Kanban (`/pipeline`)

6 columnas: Nuevo → Contactado → Respondió → Reunión → Ganado → Perdido

**Panel de detalle lateral por prospecto:**

| Sección | Detalle |
|---------|---------|
| Notas | Auto-guardado al blur (PATCH `/api/prospects/[id]`) |
| Recordatorio | Fecha de próximo contacto. Alerta roja si vencido. |
| Propuesta PDF | Formulario inline: título, descripción, precio, plazo, hosting, SEO. Descarga directa. |
| Calculador de ROI | Versión compacta colapsable. |
| Compartir auditoría | Token 24 chars → URL pública `/a/[token]` (30 días). Copia al portapapeles. |
| Historial de actividad | Timeline colapsable lazy-loaded: creación, auditorías, mensajes, notas. |

### Herramientas y vistas

| Ruta | Descripción |
|------|-------------|
| `/herramientas` | Calculador de ROI standalone para reuniones de venta |
| `/mapa` | Pines coloreados por estado en OpenStreetMap. Filtra lat=0/lng=0. |
| `/a/[token]` | Auditoría pública compartible (sin auth). Expira 30 días. |
| `/metrics` | Cuota mensual + funnel de conversión con barras y tasas entre etapas |

---

## API Routes

### Negocios
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/businesses/manual` | Añadir negocio manualmente |
| POST | `/api/businesses/import` | Importar CSV (hasta 200 filas) |
| POST | `/api/places/search` | Búsqueda Google Places |

### Prospectos
| Método | Ruta | Descripción |
|--------|------|-------------|
| PATCH | `/api/prospects/[id]` | Actualizar estado, notas, recordatorio |
| GET | `/api/prospects/[id]/timeline` | Historial de actividad |

### Mensajes y auditorías
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/messages/generate` | Generar mensaje con IA (cuota) |
| POST | `/api/messages/copy` | Registrar copia de mensaje |
| POST | `/api/audit/generate` | Generar auditoría PDF (cuota) |
| GET | `/api/audits/latest` | Auditoría más reciente de un negocio |
| POST | `/api/audits/[id]/share` | Crear/recuperar token compartible |

### Propuestas y Stripe
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/proposals/generate` | PDF de propuesta comercial (descarga directa) |
| POST | `/api/stripe/checkout` | Crear sesión de pago |
| POST | `/api/stripe/portal` | Portal de gestión de suscripción |
| POST | `/api/stripe/webhook` | Webhook de Stripe (idempotente) |

### Exportación
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/export/prospects` | Exportar todos los prospectos en CSV |

---

## Base de datos (Supabase)

RLS habilitada en todas las tablas con datos de usuario. Sin excepciones.

| Tabla | Descripción |
|-------|-------------|
| `users_profile` | Perfil del freelancer (nombre, descripción, tono, prueba social) |
| `businesses` | Negocios guardados (lat/lng, place_id único por user) |
| `prospects` | Estado en el pipeline por negocio y usuario |
| `scores` | Puntuación y breakdown de señales por negocio |
| `audits` | Auditorías PDF generadas (ruta en Storage) |
| `audit_share_tokens` | Tokens públicos de auditoría (30 días) |
| `messages` | Mensajes generados con IA |
| `subscriptions` | Suscripción Stripe por usuario |
| `usage_logs` | Log de acciones para cuotas y timeline |
| `stripe_events` | Eventos de webhook procesados (idempotencia) |

**Storage:** bucket `audit-pdfs` — acceso privado, URLs firmadas de 1h.

### Migraciones pendientes de aplicar en Supabase

```
supabase/migrations/004_audit_share_tokens.sql
```

---

## Variables de entorno

Ver `.env.example` para nombres completos y comentarios.

| Variable | Estado | Notas |
|----------|--------|-------|
| `GOOGLE_PLACES_API_KEY` | ⚠️ Pendiente | Activar Places API (New) en GCP + billing |
| `ANTHROPIC_API_KEY` | ✅ OK | Para mensajes (Haiku) |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ OK | — |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ OK | — |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ OK | Solo servidor — adminClient |
| `STRIPE_SECRET_KEY` | ⚠️ Pendiente | Solo servidor |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ Pendiente | Solo servidor |
| `STRIPE_PRICE_ID_PRO` | ⚠️ Pendiente | ID del precio mensual Pro en Stripe |
| `STRIPE_PRICE_ID_AGENCY` | ⚠️ Pendiente | ID del precio mensual Agencia en Stripe |
| `NEXT_PUBLIC_POSTHOG_KEY` | ✅ OK | Analítica PostHog EU |
| `NEXT_PUBLIC_POSTHOG_HOST` | ✅ OK | `https://eu.posthog.com` |

---

## Pendientes antes del lanzamiento

### Acciones en servicios externos

1. **Google Cloud Console** → Activar *Places API (New)* en proyecto `800848181104` + añadir facturación ($200/mes gratis, no se cobra a ese nivel de uso)
2. **Google Cloud Console** → OAuth consent screen → Publicar la app (quitar modo "Prueba")
3. **Stripe Dashboard** → Crear productos Pro (29 €/mes) y Agencia (79 €/mes) → copiar Price IDs a `.env.local` y Vercel
4. **Supabase Dashboard** → Aplicar migración `004_audit_share_tokens.sql` (SQL Editor o `supabase db push`)
5. **Vercel** → Añadir variables Stripe como variables de entorno del proyecto

### Legal (`TODO-LEGAL` antes de lanzar)

- [ ] Política de privacidad, aviso legal, cookies y términos
- [ ] Email en frío: revisar LSSI art. 21 con abogado
- [ ] TOS Google Maps Platform: revisar uso comercial
- [ ] Facturación e IVA: configurar en Stripe

---

## Estructura de carpetas clave

```
src/app/              # páginas y API routes (App Router)
src/components/       # componentes React
  kanban/             # Kanban, tarjetas, panel de detalle, timeline, propuesta
  map/                # LeafletMap, ProspectMap, ProspectMapClient (wrapper SSR)
  prospecting/        # SearchForm, AddManualForm, ImportCsvForm, MessageGenerator
  shared/             # RoiCalculator, ProfileForm, UpgradeGate
src/lib/
  scoring/config.ts   # ÚNICO lugar para pesos de señales
  stripe/config.ts    # ÚNICO lugar para límites de plan
  messages/           # generator.ts, prompt.ts, sector-hints.ts
  audit/              # generator.tsx (PDF técnico), recommendations.ts
  proposal/           # generator.tsx (PDF comercial)
  kanban/utils.ts     # tipos y helpers del Kanban
supabase/migrations/  # SQL numeradas (001_, 002_, ...)
tests/unit/           # Vitest
tests/e2e/            # Playwright
```
