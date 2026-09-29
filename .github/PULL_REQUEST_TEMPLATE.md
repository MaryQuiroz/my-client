## Descripción
<!-- Qué hace este PR en 1-3 frases -->

## Cambios principales
<!-- Lista de archivos/módulos modificados y qué cambió -->
-

## Cómo probar
<!-- Pasos mínimos para verificar que funciona -->
1.

## Checklist

### Obligatorio
- [ ] `npm run verify` pasa sin errores (lint + typecheck + test + build)
- [ ] Tests añadidos o actualizados para la lógica modificada
- [ ] Sin valores hardcodeados (servicios, zonas, mensajes)

### Seguridad
- [ ] Sin claves de API ni secretos en el código
- [ ] Variables nuevas añadidas a `.env.example` con comentario
- [ ] RLS habilitado en tablas nuevas (si aplica)
- [ ] Webhooks de Stripe verificados con firma (si aplica)

### Base de datos
- [ ] Migración SQL en `supabase/migrations/` (si aplica)
- [ ] Índices añadidos en columnas de búsqueda frecuente (si aplica)

### Cumplimiento
- [ ] Puntos legales pendientes marcados con `TODO-LEGAL`
- [ ] Mensajes generados siguen las reglas de honestidad (sin cifras inventadas)

### Documentación
- [ ] `CLAUDE.md` actualizado si cambian convenciones (si aplica)
- [ ] `.env.example` actualizado (si aplica)

## TODO-LEGAL pendientes
<!-- Lista los puntos que requieren revisión legal, o escribe "Ninguno" -->
