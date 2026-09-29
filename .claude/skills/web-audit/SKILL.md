---
name: web-audit
description: Usar cuando se implementa o modifica la generación de auditorías en PDF. Cubre fuentes de datos, estructura del PDF, lenguaje permitido y prohibido, y cómo testear.
---

# Skill: Web Audit (PDF)

## Biblioteca: @react-pdf/renderer
Genera el PDF en el servidor (Route Handler `/api/audit`). No usar en componentes de cliente.

## Datos que incluye la auditoría
Solo datos medibles con fuente y fecha:

| Métrica | Fuente | Nota |
|---------|--------|------|
| Velocidad en móvil | PageSpeed Insights API | Puntuación 0-100 |
| HTTPS activo | Comprobación HTTP directa | Sí/No + fecha caducidad si aplica |
| Adaptación móvil | PageSpeed / Mobile-Friendly Test API | Sí/No |
| Reserva online / WhatsApp | Análisis de la URL del negocio | Sí/No |
| Nota Google y nº reseñas | Google Places API | Número exacto |
| Reseñas sin responder | Google Places API | Número en últimos 90 días |

## Estructura del PDF (1-2 páginas)
1. **Cabecera**: logo y nombre del usuario (del perfil), nombre del negocio, fecha de generación
2. **Tabla de hallazgos**: una fila por métrica con valor, estado (ok/atención/crítico) y fuente
3. **Recomendaciones**: una por cada problema detectado, redactadas en tono neutro y constructivo
4. **Pie**: "Datos medidos el [fecha]. Fuentes: [lista de APIs]"

## Lenguaje
**Permitido**: neutral, constructivo, específico
- "La web carga en 8,2 s en móvil (referencia: < 3 s)"
- "No se detectó sistema de reserva online ni enlace a WhatsApp"

**Prohibido**:
- Frases despectivas ("su web es obsoleta", "está muy mal")
- Promesas de resultados ("tras nuestra intervención aumentará...")
- Datos no medidos ("probablemente sus clientes se van por...")
- Cifras sin fuente

## Almacenamiento
- El PDF se genera bajo demanda y se guarda en Supabase Storage
- La URL se guarda en la tabla `audits` con `data_snapshot` (jsonb con los datos en ese momento)
- TODO-LEGAL: verificar cuánto tiempo se puede conservar datos de Google Places en el snapshot

## Cómo testear
```typescript
// tests/unit/audit/pdf.test.ts
it('incluye logo y nombre del usuario en la cabecera', () => { ... })
it('cada métrica tiene fuente y fecha', () => { ... })
it('no incluye promesas de resultados', () => { ... })
it('genera un Buffer válido (bytes > 0)', () => { ... })
```
