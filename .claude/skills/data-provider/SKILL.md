---
name: data-provider
description: Usar cuando se añade un nuevo proveedor de lugares (Places API), se modifica la interfaz PlacesProvider o se necesita saber qué datos se pueden almacenar de cada proveedor.
---

# Skill: Data Provider (PlacesProvider)

## Interfaz central
`src/lib/places/types.ts` — no modificar sin revisar el impacto en toda la lógica de negocio.

## Cómo añadir un nuevo proveedor

1. Crea `src/lib/places/<nombre>.ts` que implemente `PlacesProvider`:
```typescript
import type { PlacesProvider, PlaceResult, SearchParams } from './types'

export class MiProveedorProvider implements PlacesProvider {
  async search(params: SearchParams): Promise<PlaceResult[]> { ... }
  async getDetails(placeId: string): Promise<PlaceResult> { ... }
  getName() { return 'mi-proveedor' as const }
}
```

2. Registra el proveedor en `src/lib/places/index.ts`:
```typescript
case 'mi-proveedor':
  return new MiProveedorProvider()
```

3. Añade `'mi-proveedor'` al tipo `ProviderName` en `types.ts`.

4. Añade la variable de entorno en `.env.example`.

5. Escribe tests en `tests/unit/places/<nombre>.test.ts`.

## Qué datos se pueden almacenar

### Google Places (TODO-LEGAL: verificar TOS vigente)
- **Permitido persistir**: `place_id` (identificador)
- **Solo en caché temporal**: nombre, dirección, teléfono, web, rating, reseñas
- **Regla**: refrescar desde la API si `cached_at` > 30 días
- **Prohibido**: redistribuir, vender o usar fuera de la aplicación

### OpenStreetMap / Overpass
- Datos bajo licencia ODbL — se pueden almacenar con atribución
- `osm_id` como identificador persistente

### Foursquare
- Revisar TOS vigente. Generalmente permite almacenamiento limitado con atribución.

## Caché y deduplicación
- Deduplicar por `(user_id, place_id, provider)` — índice único en tabla `businesses`
- Campo `cached_at` para saber cuándo refrescar
- Nunca mostrar datos de la caché sin indicar la fecha de la última actualización

## Regla general
La lógica de negocio (scoring, mensajes, auditoría) NUNCA importa un proveedor concreto.
Solo importa desde `@/lib/places` (el índice con la factory).
