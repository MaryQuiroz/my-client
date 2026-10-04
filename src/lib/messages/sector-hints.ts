export interface SectorHint {
  keywords: string[]
  painPoints: string[]
  valueProps: string[]
  exampleOpener: string
}

const SECTOR_HINTS: SectorHint[] = [
  {
    keywords: ['restaurante', 'bar', 'cafeteria', 'cafetería', 'pizzeria', 'pizzería', 'hamburgueseria', 'hamburguesería', 'sushi', 'tapas', 'hosteleria', 'hostelería', 'gastronomia', 'gastronomía'],
    painPoints: ['menú digital desactualizado', 'sin opción de reserva online', 'fotos del local de baja calidad', 'sin reseñas visibles'],
    valueProps: ['aumentar reservas online', 'mostrar el menú actualizado', 'destacar en Google Maps'],
    exampleOpener: 'Hola, vi que tenéis local en [ciudad] y quería comentaros algo sobre vuestra presencia online…',
  },
  {
    keywords: ['peluqueria', 'peluquería', 'barberia', 'barbería', 'salon de belleza', 'salón de belleza', 'estetica', 'estética', 'nail', 'uñas', 'spa', 'masajes', 'depilacion', 'depilación'],
    painPoints: ['sin reservas online', 'galería de trabajos desactualizada', 'difícil encontrar en Google'],
    valueProps: ['sistema de reservas 24h', 'mostrar portfolio de trabajos', 'captar nuevos clientes locales'],
    exampleOpener: 'Hola, encontré vuestro salón buscando en Google y me fijé en que podríais estar perdiendo clientes…',
  },
  {
    keywords: ['clinica', 'clínica', 'medico', 'médico', 'dentista', 'fisio', 'fisioterapia', 'psicologia', 'psicología', 'veterinaria', 'farmacia', 'salud', 'optica', 'óptica'],
    painPoints: ['cita por teléfono únicamente', 'sin información clara de servicios', 'web antigua sin certificado SSL'],
    valueProps: ['citas online 24h', 'transmitir confianza y profesionalidad', 'reducir llamadas repetitivas'],
    exampleOpener: 'Hola, soy diseñador web y vi vuestra consulta en Google. Tengo algo que podría interesaros…',
  },
  {
    keywords: ['gimnasio', 'gym', 'crossfit', 'pilates', 'yoga', 'fitness', 'entrenamiento personal', 'deporte', 'padel', 'pádel', 'tenis'],
    painPoints: ['sin sistema de inscripción online', 'horario difícil de encontrar', 'sin visibilidad en buscadores'],
    valueProps: ['inscripciones y reservas online', 'mostrar actividades y horarios', 'captar nuevos socios con Google'],
    exampleOpener: 'Hola, vi vuestro centro deportivo y me di cuenta de algo que podría ayudaros a conseguir más socios…',
  },
  {
    keywords: ['abogado', 'abogados', 'despacho', 'asesor', 'gestor', 'gestoria', 'gestoría', 'notaria', 'notaría', 'inmobiliaria', 'agencia inmobiliaria'],
    painPoints: ['web sin información de servicios clara', 'sin formulario de contacto', 'no aparece en primeras posiciones de Google'],
    valueProps: ['generar leads cualificados', 'transmitir autoridad y confianza', 'posicionamiento local en Google'],
    exampleOpener: 'Hola, busqué vuestros servicios en Google y me pareció que hay margen para mejorar vuestra captación online…',
  },
  {
    keywords: ['hotel', 'hostal', 'alojamiento', 'apartamento turistico', 'apartamento turístico', 'rural', 'alquiler vacacional', 'airbnb'],
    painPoints: ['dependen de Booking/Airbnb (comisiones altas)', 'sin sistema de reservas directas', 'fotos de baja calidad'],
    valueProps: ['reservas directas sin comisiones', 'mayor control de la imagen', 'aparecer antes en Google'],
    exampleOpener: 'Hola, encontré vuestro alojamiento y tengo una propuesta que podría ahorraros dinero en comisiones…',
  },
  {
    keywords: ['tienda', 'comercio', 'ropa', 'moda', 'calzado', 'joyeria', 'joyería', 'papeleria', 'papelería', 'libreria', 'librería', 'ferreteria', 'ferretería', 'floristeria', 'floristería'],
    painPoints: ['sin tienda online', 'poca visibilidad en Google local', 'sin catálogo de productos actualizado'],
    valueProps: ['venta online', 'aparecer en Google cuando buscan tus productos', 'catálogo digital siempre actualizado'],
    exampleOpener: 'Hola, pasé por vuestro local y quería comentaros cómo podríais vender también online…',
  },
]

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

function matchesKeyword(category: string, keyword: string): boolean {
  const normCat = normalize(category)
  const normKw = normalize(keyword)
  // Multi-word keywords: substring match is fine (e.g. "agencia inmobiliaria")
  if (normKw.includes(' ')) {
    return normCat.includes(normKw)
  }
  // Single-word keywords: require word-boundary match to avoid "bar" ⊂ "barberia"
  const pattern = new RegExp(`(?<![a-z])${normKw}(?![a-z])`)
  return pattern.test(normCat)
}

export function getSectorHint(category: string | null | undefined): SectorHint | null {
  if (!category) return null
  for (const hint of SECTOR_HINTS) {
    if (hint.keywords.some((kw) => matchesKeyword(category, kw))) {
      return hint
    }
  }
  return null
}
