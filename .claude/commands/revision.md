# Comando: Revisión crítica

Usa este comando para revisar código existente antes de un PR o cuando el usuario pida una revisión.

## Qué revisar

### Seguridad
- ¿Hay claves de API o secretos en el código?
- ¿Las rutas de API validan con Zod antes de procesar?
- ¿Las tablas con datos de usuario tienen RLS activo?
- ¿Los webhooks de Stripe verifican la firma antes de procesar?
- ¿Hay rate limiting en todas las rutas de API?
- ¿El service role de Supabase solo se usa en servidor?

### Lógica de negocio
- ¿Hay valores hardcodeados (servicios, zonas, mensajes)?
- ¿La lógica de negocio está en `src/lib/` y no en componentes?
- ¿Se usa `PlacesProvider` en lugar de llamar directamente a Google?
- ¿Los pesos de señales están solo en `scoring/config.ts`?
- ¿Los límites de plan están solo en `stripe/config.ts`?

### Tests
- ¿Los cambios de lógica tienen tests?
- ¿Los tests pasan con `npm run test`?
- ¿Se testean los casos límite y los errores?

### Cumplimiento
- ¿Los mensajes generados siguen las reglas de honestidad?
- ¿Los emails incluyen opt-out?
- ¿Los puntos legales están marcados con TODO-LEGAL?

## Formato de respuesta
Lista los problemas encontrados por categoría (Bloqueante / Recomendado / Menor).
No sugieras cambios no pedidos ni refactorizaciones que no afecten a la seguridad o corrección.
