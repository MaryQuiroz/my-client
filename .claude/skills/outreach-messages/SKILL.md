---
name: outreach-messages
description: Usar cuando se implementan, modifican o testean los mensajes de prospección generados con Anthropic. Cubre reglas de redacción, plantillas por tipo de problema, variantes y opt-out.
---

# Skill: Outreach Messages

## Regla crítica de honestidad
Los mensajes SOLO pueden contener:
- Datos verificables del negocio (nombre, problema detectado y medido)
- Lo que el usuario escribió en su perfil (servicio, promesa, prueba social)

**Prohibido**:
- Inventar cifras o porcentajes ("aumenta tus ventas un 30%")
- Garantías ("te garantizamos")
- Mencionar casos de éxito no escritos en el perfil
- Frases condescendientes o que impliquen que el negocio es malo

## Canales y variantes
Cada generación produce 2-3 variantes por canal:
- **WhatsApp**: corto, directo, ≤ 3 frases, un solo CTA
- **Guion de llamada**: estructura problema → solución → CTA, ≤ 120 palabras
- **Email**: con asunto, cuerpo y línea de baja/opt-out obligatoria (TODO-LEGAL: revisar LSSI)

**Prioridad**: WhatsApp > llamada > email

## Plantillas por tipo de problema
| Problema | Plantilla base |
|----------|---------------|
| Sin web | `sin-web` |
| Web lenta | `slow-web` |
| Sin reservas | `no-booking` |
| Reseñas sin responder | `unanswered-reviews` |
| Seguimiento 3 días | `followup-3d` |
| Seguimiento 7 días | `followup-7d` |

## Prompt para Anthropic (estructura)
```
Eres un asistente de ventas B2B honesto. Redacta un mensaje de prospección
para [canal] con las siguientes restricciones:
- Solo los datos verificados del negocio: [datos del breakdown]
- Lo que el proveedor ofrece (solo si está en el perfil): [service_description]
- Promesa (solo si está en el perfil): [service_promise]
- Prueba social (solo si está en el perfil): [social_proof]
- Tono: [communication_tone del perfil]
- Máximo: [límite por canal]
- CTA único: pedir una llamada de 15 minutos
- Si es email: incluir línea de baja
```

## Reglas de implementación
- La generación ocurre SOLO en servidor (`src/lib/messages/generator.ts`)
- El usuario copia el mensaje y lo envía manualmente (no hay envío automático)
- Guardar en tabla `messages` con `channel`, `variant` y `content`
- Rate limit: máx. 10 generaciones/hora por usuario en el plan free

## Ejemplos

### Bueno (WhatsApp)
> "Hola [Nombre], vi que [Restaurante] no tiene web propia. Muchos clientes buscan carta y reservas online antes de visitar. ¿Te parece si hablamos 15 minutos esta semana sobre cómo podría ayudarte?"

### Malo (prohibido)
> "Tu web es una vergüenza. Garantizamos +50% de reservas en 30 días como hicimos con otros 200 restaurantes."

## Cómo testear
```typescript
// tests/unit/messages/generator.test.ts
it('no incluye promesas si el perfil no las tiene', () => { ... })
it('no incluye casos de éxito si el perfil no los tiene', () => { ... })
it('el email incluye línea de opt-out', () => { ... })
it('el mensaje de WhatsApp es menor de 300 caracteres', () => { ... })
```
