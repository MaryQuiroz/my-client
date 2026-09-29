---
name: lead-scoring
description: Usar cuando se implementa, modifica o testea el cálculo de puntuación (0-100) de negocios. Cubre señales, pesos, breakdown explicable y overrides por usuario.
---

# Skill: Lead Scoring

## Principio
La puntuación debe ser **siempre explicable**: el usuario ve exactamente cuántos puntos aporta cada señal. Solo se usan señales medibles y verificables.

## Arquitectura
- **Config central**: `src/lib/scoring/config.ts` — único archivo con señales y pesos por defecto. No cambiar pesos en otro sitio.
- **Lógica de scoring**: `src/lib/scoring/scorer.ts` — función pura `scoreBusinesss(place, userWeights?)` → `ScoringResult`
- **Tipos de señales**: `src/lib/scoring/signals.ts`
- **Override por usuario**: tabla `signal_weights` en Supabase. Si el usuario tiene pesos propios, se mezclan con los defaults.

## Estructura de ScoringResult
```typescript
interface SignalBreakdown {
  key: SignalKey
  label: string
  score: number      // puntos reales aportados (0 a maxScore)
  maxScore: number
  detected: boolean  // si la señal se detectó
  source: string     // qué API o método lo midió
  measuredAt: string // ISO timestamp
}

interface ScoringResult {
  totalScore: number          // 0-100
  breakdown: SignalBreakdown[]
  scoredAt: string
}
```

## Señales y pesos por defecto (ver config.ts)
| Señal | Puntos máx |
|-------|-----------|
| Sin web propia | 25 |
| Web lenta en móvil (PageSpeed < 50) | 20 |
| Sin HTTPS | 15 |
| Web no adaptada a móvil | 15 |
| Sin reserva ni WhatsApp | 10 |
| Nota baja en Google (< 4.0 o < 10 reseñas) | 10 |
| Reseñas recientes sin responder | 5 |

## Cómo testear
```typescript
// tests/unit/scoring/scorer.test.ts
import { scoreBusiness } from '@/lib/scoring/scorer'

it('devuelve 0 para un negocio con web rápida, HTTPS y buenas reseñas', () => { ... })
it('devuelve 100 para un negocio sin web ni nada', () => { ... })
it('respeta los pesos personalizados del usuario', () => { ... })
it('el breakdown suma el totalScore', () => { ... })
it('cada señal indica su fuente y fecha de medición', () => { ... })
```

## Reglas
- La puntuación se guarda en la tabla `scores` con `breakdown` en jsonb.
- Nunca mostrar una señal sin fuente y fecha.
- Si PageSpeed falla, omitir la señal del breakdown (no penalizar por error de API).
