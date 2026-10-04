// Dominios conocidos de plataformas de reservas y agregadores.
// Una URL de estos dominios en el campo "website" de Google Maps significa
// que el negocio NO tiene web propia — solo usa plataformas externas.
const AGGREGATOR_DOMAINS = [
  // Reservas de restaurantes
  'dish.co',
  'thefork.com',
  'eltenedor.com',
  'restoo.es',
  'quandoo.com',
  'bookatable.com',
  'covermanager.com',
  'forking.es',
  // Redes sociales (no son web propia)
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'x.com',
  'tiktok.com',
  'linktr.ee',
  'linktree.com',
  // Agregadores de valoraciones
  'tripadvisor.com',
  'yelp.com',
  'atrapalo.com',
  // Google Maps / perfiles de empresa
  'maps.google.com',
  'goo.gl',
  'g.page',
  // Delivery
  'ubereats.com',
  'justeat.es',
  'deliveroo.es',
  'glovo.com',
  // Reservas de citas (peluquerías, clínicas)
  'treatwell.es',
  'fresha.com',
  'booksy.com',
  'mindbodyonline.com',
  // Hoteles y turismo
  'booking.com',
  'airbnb.com',
  'expedia.com',
]

export function isAggregatorUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '')
    return AGGREGATOR_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith('.' + domain)
    )
  } catch {
    return false
  }
}

export function hasOwnWebsite(url: string | null | undefined): boolean {
  if (!url) return false
  return !isAggregatorUrl(url)
}
