# Roadmap — My Client

Cada fase es una rama y un PR. Los criterios de aceptación deben cumplirse para cerrar la fase.

---

## Fase 0 — Setup (`chore/setup`) ✅

**Estado**: Completado

Estructura base del proyecto: Next.js 16 + TypeScript + Tailwind + shadcn/ui + Vitest + Playwright. Scripts `verify`, `.env.example`, CLAUDE.md, skills, comandos, subagentes y CI con GitHub Actions.

**Criterios de aceptación**:
- `npm run verify` pasa sin errores
- Estructura de carpetas creada según plan
- Interfaz `PlacesProvider` y config de señales/pesos en su lugar
- CI verde en GitHub Actions
- CLAUDE.md con todas las convenciones documentadas

---

## Fase 1 — Autenticación y perfil (`feat/auth-profile`)

Integración de Supabase Auth (email + magic link). Onboarding para nuevos usuarios. Página "Mi perfil" para editar el perfil del proveedor (servicio, promesa, prueba social, tono, nombre, logo).

**Criterios de aceptación**:
- Registro, login y logout funcionan con Supabase Auth
- Onboarding redirige a completar el perfil en el primer acceso
- El perfil se guarda en `users_profile` con validación Zod
- Las rutas del dashboard están protegidas (redirect a login si no hay sesión)
- Tests: validaciones del perfil, protección de rutas

---

## Fase 2 — Esquema de base de datos y RLS (`feat/database`)

Migraciones SQL para las 11 tablas del modelo de datos. Políticas RLS completas para cada tabla. Clientes de Supabase (browser, server, admin).

**Criterios de aceptación**:
- Migraciones numeradas en `supabase/migrations/`
- RLS activo en todas las tablas con datos de usuario
- Tests de RLS: usuario A no puede leer datos de usuario B
- `supabase/admin.ts` solo importado en archivos de servidor
- Tipos TypeScript generados o definidos manualmente para cada tabla

---

## Fase 3 — PlacesProvider + Google Places + Mapa (`feat/places-map`)

Implementación de Google Places API detrás de la interfaz `PlacesProvider`. Búsqueda de negocios por tipo y zona (inputs libres). Lista de resultados con deduplicación por `place_id`. Mapa interactivo con Leaflet + OpenStreetMap.

**Criterios de aceptación**:
- La búsqueda usa `getPlacesProvider()` (nunca Google directamente en lógica de negocio)
- Resultados deduplicados por `(user_id, place_id)`
- Mapa muestra marcadores clicables con datos básicos del negocio
- Rate limiting en `/api/places/search`
- Tests: deduplicación, validación de parámetros de búsqueda, mock del proveedor
- TODO-LEGAL marcados en los datos que no se pueden persistir a largo plazo

---

## Fase 4 — Scoring explicable + PageSpeed (`feat/scoring`)

Cálculo de puntuación 0-100 con desglose por señal. Integración con PageSpeed Insights API. Pesos por defecto y overrides por usuario. Vista de desglose en la tarjeta del negocio.

**Criterios de aceptación**:
- `scoreBusiness()` es una función pura testeada
- El desglose muestra puntos, fuente y fecha para cada señal
- Los pesos del usuario sobreescriben los defaults (tabla `signal_weights`)
- PageSpeed falla sin romper la puntuación (señal omitida)
- Tests: función pura con varios escenarios, pesos personalizados, suma del breakdown

---

## Fase 5 — Auditoría en PDF (`feat/audit-pdf`)

Generación de PDF de 1-2 páginas con `@react-pdf/renderer` en servidor. Incluye logo y nombre del usuario, tabla de métricas con fuentes, y recomendaciones en tono neutro. Almacenamiento en Supabase Storage.

**Criterios de aceptación**:
- El PDF se genera solo en servidor (`/api/audit`)
- Incluye logo y nombre del usuario (del perfil)
- Cada métrica tiene fuente y fecha de medición
- Sin promesas de resultados ni lenguaje despectivo
- PDF guardado en Supabase Storage con URL en tabla `audits`
- Tests: estructura del PDF, ausencia de frases prohibidas

---

## Fase 6 — Generación de mensajes (`feat/messages`)

Generación de mensajes de prospección con Anthropic Claude. Canales: WhatsApp, guion de llamada y email (con aviso de cumplimiento). 2-3 variantes por canal. Plantillas por tipo de problema. Seguimientos a 3 y 7 días.

**Criterios de aceptación**:
- Generación solo en servidor (`/api/messages`)
- Los mensajes no incluyen datos no verificados ni cifras inventadas
- Si el perfil no tiene promesa, el mensaje no la incluye
- Los emails incluyen línea de opt-out
- El usuario copia el mensaje manualmente (sin envío automático)
- Tests: regla de honestidad, opt-out en emails, longitud máxima por canal

---

## Fase 7 — Kanban y recordatorios (`feat/pipeline`)

Kanban con dnd-kit: columnas Nuevo → Contactado → Respondió → Reunión → Ganado / Perdido. Drag-and-drop entre columnas. Notas y fecha del próximo contacto por prospecto. Recordatorios visuales a los 3 y 7 días.

**Criterios de aceptación**:
- Drag-and-drop funciona y persiste el cambio de estado en `prospects`
- Los recordatorios destacan visualmente los prospectos con próximo contacto vencido
- Exportación del pipeline a CSV
- Tests: cambio de estado, validación de fechas, exportación CSV

---

## Fase 8 — Métricas y exportación CSV (`feat/metrics`)

Panel de métricas: mensajes enviados, respuestas, auditorías, reuniones, ventas y coste por reunión. Coste estimado de API por acción registrado en `usage_logs`. Exportación del kanban a CSV.

**Criterios de aceptación**:
- Métricas calculadas desde `usage_logs` y `prospects`
- Coste estimado por acción registrado correctamente
- Exportación CSV con todos los campos del pipeline
- Tests: cálculo de métricas, formato del CSV

---

## Fase 9 — Planes, cuotas y rate limiting (`feat/quotas`)

Límites por plan (definidos en `stripe/config.ts`). Comprobación de cuota antes de cada acción consumible. Rate limiting en todas las rutas de API. Propuesta de upgrade al llegar al límite.

**Criterios de aceptación**:
- Búsquedas, auditorías y mensajes se bloquean al llegar al límite del plan
- Rate limiting activo en todas las rutas `/api/*`
- Al llegar al límite, UI muestra propuesta de mejora de plan
- Tests: bloqueo al superar el límite, respuesta 429, propuesta de upgrade

---

## Fase 10 — Stripe: suscripciones, portal y webhooks (`feat/stripe`)

Stripe Checkout para suscripciones Free/Pro/Agencia. Customer Portal para gestión del plan. Webhooks verificados con firma e idempotentes. Sincronización de plan en tabla `subscriptions`.

**Criterios de aceptación**:
- Checkout crea la suscripción y redirige correctamente
- Webhooks verifican firma antes de procesar
- Tabla `stripe_events` previene doble procesado
- Customer Portal permite cambiar o cancelar el plan
- Tests: idempotencia de webhooks, firma inválida rechazada, actualización de plan

---

## Fase 11 — Panel de administración (`feat/admin`)

Panel solo para el rol `admin`: listado de usuarios con plan, uso y coste estimado. Comprobación de rol en servidor (tabla `admin_users`, service role). Cálculo de margen por usuario.

**Criterios de aceptación**:
- Acceso denegado a cualquier usuario que no sea admin (comprobado en servidor)
- Panel muestra plan, uso y coste estimado por usuario
- Tests: denegación de acceso a no-admins, cálculo de margen

---

## Fase 12 — Analítica de producto (`feat/analytics`)

Integración de PostHog EU con consentimiento RGPD. Eventos clave: búsqueda, auditoría generada, mensaje copiado, upgrade de plan. Banner de consentimiento de cookies.

**Criterios de aceptación**:
- PostHog solo se inicializa tras consentimiento explícito
- Eventos clave implementados y visibles en el dashboard de PostHog
- Sin datos personales en los eventos (solo IDs anonimizados)
- TODO-LEGAL marcado para revisión del banner de cookies

---

## Fase 13 — Legal, SEO y landing pública (`feat/legal-seo`)

Landing pública con SEO básico. Páginas de política de privacidad, aviso legal, cookies y términos del servicio. Metadatos Open Graph. Sitemap.

**Criterios de aceptación**:
- Landing pública accesible sin autenticación
- Páginas legales completas (requieren revisión de abogado antes de publicar)
- `robots.txt` y `sitemap.xml` generados
- Open Graph y metadatos de Twitter configurados
- TODO-LEGAL: todas las páginas legales revisadas por abogado

---

## Fase 14 — Despliegue en Vercel (`feat/deploy`)

Configuración de Vercel, variables de entorno de producción, dominio personalizado, protección de rama `main` en GitHub, monitorización de errores.

**Criterios de aceptación**:
- Despliegue automático desde `main` en Vercel
- Variables de entorno de producción configuradas (sin valores de desarrollo)
- Dominio personalizado con HTTPS
- Rama `main` protegida en GitHub (requiere PR + CI verde)
- `npm run verify` pasa en el entorno de producción
