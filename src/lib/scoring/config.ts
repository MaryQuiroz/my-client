// Configuración de señales y pesos por defecto — Fase 4
// Este es el ÚNICO archivo donde se definen los pesos de las señales.
// Cada usuario puede sobreescribir sus propios pesos en la tabla signal_weights.

export type SignalKey =
  | 'no_website'
  | 'slow_mobile'
  | 'no_https'
  | 'not_mobile_friendly'
  | 'no_booking_or_whatsapp'
  | 'low_rating'
  | 'unanswered_reviews'

export interface SignalConfig {
  key: SignalKey
  label: string
  description: string
  defaultWeight: number // 0-100, suma total puede superar 100 (se normaliza)
  maxScore: number // puntos máximos que puede aportar esta señal
}

export const DEFAULT_SIGNAL_CONFIG: SignalConfig[] = [
  {
    key: 'no_website',
    label: 'Sin web propia',
    description: 'El negocio solo tiene redes sociales o ficha de Google, sin web propia',
    defaultWeight: 1.0,
    maxScore: 25,
  },
  {
    key: 'slow_mobile',
    label: 'Web lenta en móvil',
    description: 'PageSpeed Insights puntúa por debajo de 75 en móvil (necesita mejora)',
    defaultWeight: 0.8,
    maxScore: 20,
  },
  {
    key: 'no_https',
    label: 'Sin HTTPS',
    description: 'La web no usa HTTPS o el certificado está caducado',
    defaultWeight: 0.7,
    maxScore: 15,
  },
  {
    key: 'not_mobile_friendly',
    label: 'Web no adaptada a móvil',
    description: 'La web no supera el test de usabilidad en móvil de Google',
    defaultWeight: 0.7,
    maxScore: 15,
  },
  {
    key: 'no_booking_or_whatsapp',
    label: 'Sin teléfono ni contacto',
    description: 'Tiene web pero no tiene teléfono visible en Google Maps (sin WhatsApp ni contacto directo)',
    defaultWeight: 0.6,
    maxScore: 10,
  },
  {
    key: 'low_rating',
    label: 'Pocas reseñas o nota baja',
    description: 'Nota media inferior a 4.2 o menos de 20 reseñas (negocio sin visibilidad suficiente)',
    defaultWeight: 0.5,
    maxScore: 10,
  },
  {
    key: 'unanswered_reviews',
    label: 'Reseñas sin responder',
    description: 'Tiene reseñas recientes (últimos 90 días) sin respuesta del negocio',
    defaultWeight: 0.4,
    maxScore: 5,
  },
]
