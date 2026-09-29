---
name: supabase-rls
description: Usar cuando se crean o modifican tablas de Supabase, se escriben migraciones SQL o se implementan políticas RLS. Incluye checklist de seguridad y ejemplos de políticas.
---

# Skill: Supabase RLS

## Regla fundamental
**Toda tabla con datos de usuario DEBE tener RLS habilitado antes del primer INSERT.**
Sin excepción. Si dudas, actívalo igualmente.

## Checklist para cada nueva tabla

- [ ] `ALTER TABLE <tabla> ENABLE ROW LEVEL SECURITY;`
- [ ] Política SELECT: `user_id = auth.uid()` (o `true` si es dato público)
- [ ] Política INSERT: `user_id = auth.uid()` con `WITH CHECK`
- [ ] Política UPDATE: `user_id = auth.uid()` (si aplica)
- [ ] Política DELETE: `user_id = auth.uid()` (si aplica)
- [ ] Las tablas de servicio (`stripe_events`, `admin_users`) solo accesibles con service role
- [ ] Índice en `user_id` para rendimiento

## Plantilla de migración
```sql
-- supabase/migrations/XXX_nombre.sql

-- 1. Crear tabla
CREATE TABLE IF NOT EXISTS public.nombre (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- ... columnas
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE public.nombre ENABLE ROW LEVEL SECURITY;

-- 3. Políticas
CREATE POLICY "usuarios ven sus propios registros"
  ON public.nombre FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "usuarios insertan sus propios registros"
  ON public.nombre FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "usuarios actualizan sus propios registros"
  ON public.nombre FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 4. Índice de rendimiento
CREATE INDEX idx_nombre_user_id ON public.nombre(user_id);
```

## Tablas con acceso especial
- `stripe_events`: solo service role (no RLS normal, función RPC o service client)
- `admin_users`: solo service role
- `subscriptions`: RLS para SELECT del propio usuario; INSERT/UPDATE solo service role

## Cliente correcto según contexto
```typescript
// src/lib/supabase/client.ts  → componentes de cliente
// src/lib/supabase/server.ts  → Server Components y Route Handlers
// src/lib/supabase/admin.ts   → SOLO en servidor, NUNCA exportar al cliente
//                               usa SUPABASE_SERVICE_ROLE_KEY
```

## Cómo testear RLS
```typescript
// tests/unit/rls/policies.test.ts
it('usuario A no puede leer datos de usuario B', async () => {
  // Crear dos usuarios de prueba con Supabase test client
  // Insertar dato con usuario A
  // Intentar leer con usuario B → debe devolver array vacío
})
```

## Migraciones
- Numerar: `001_init.sql`, `002_add_scores.sql`, etc.
- Aplicar con: `supabase db push` (local) o en el dashboard de Supabase
- Nunca modificar una migración ya aplicada: crear una nueva
