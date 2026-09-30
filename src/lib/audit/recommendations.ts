import type { SignalKey } from '@/lib/scoring/config'
import type { SignalBreakdown } from '@/lib/scoring/scorer'

export interface Recommendation {
  signal: SignalKey
  title: string
  description: string
}

const RECOMMENDATION_MAP: Record<SignalKey, { title: string; description: string }> = {
  no_website: {
    title: 'Crear una web profesional',
    description:
      'El negocio carece de presencia web propia. Una web aumenta la credibilidad, mejora el posicionamiento en Google y permite captar clientes las 24 horas.',
  },
  slow_mobile: {
    title: 'Mejorar la velocidad en móvil',
    description:
      'La web carga lentamente en dispositivos móviles (puntuación PageSpeed < 50/100). Cada segundo de espera reduce conversiones. Se recomienda optimizar imágenes, usar caché y un hosting adecuado.',
  },
  no_https: {
    title: 'Instalar certificado SSL (HTTPS)',
    description:
      'La web no usa HTTPS. Los navegadores marcan las webs HTTP como "No seguras", lo que genera desconfianza. Un certificado SSL gratuito (Let\'s Encrypt) resuelve el problema.',
  },
  not_mobile_friendly: {
    title: 'Adaptar el diseño para móviles',
    description:
      'La web no supera el test de usabilidad móvil de Google. Más del 60 % del tráfico local proviene de smartphones. Un diseño responsive es imprescindible.',
  },
  no_booking_or_whatsapp: {
    title: 'Añadir reservas online o WhatsApp',
    description:
      'El negocio no dispone de sistema de reserva ni botón de WhatsApp. Estos canales directos multiplican la tasa de contacto y reducen llamadas telefónicas perdidas.',
  },
  low_rating: {
    title: 'Mejorar la reputación en Google',
    description:
      'La nota media en Google es inferior a 4.0 o tiene menos de 10 reseñas. Una estrategia activa de solicitud de reseñas a clientes satisfechos mejora la visibilidad y la confianza.',
  },
  unanswered_reviews: {
    title: 'Responder a las reseñas de Google',
    description:
      'Responder a reseñas (positivas y negativas) demuestra profesionalidad y mejora el posicionamiento local en Google Maps.',
  },
}

export function getRecommendations(breakdown: SignalBreakdown[]): Recommendation[] {
  return breakdown
    .filter((item) => item.fired && item.source !== 'unavailable')
    .map((item) => ({
      signal: item.signal,
      ...RECOMMENDATION_MAP[item.signal],
    }))
}
