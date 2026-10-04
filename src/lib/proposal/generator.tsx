import {
  renderToBuffer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { SignalKey } from '@/lib/scoring/config'
import type { SignalBreakdown } from '@/lib/scoring/scorer'

export interface ProposalData {
  businessName: string
  businessAddress: string
  businessPhone: string | null
  businessWebsite: string | null
  totalScore: number
  problems: string[]
  solutionTitle: string
  solutionDescription: string
  price: number
  deliveryWeeks: number
  includesHosting: boolean
  includesSeo: boolean
  freelancerName: string
  freelancerEmail: string | null
  freelancerPhone: string | null
  generatedAt: string
}

const SIGNAL_TO_CLIENT_PROBLEM: Partial<Record<SignalKey, string>> = {
  no_website: 'No tienes web propia — dependes de directorios y redes sociales',
  slow_mobile: 'Tu web carga lenta en móvil — los clientes se van antes de ver tu oferta',
  no_https: 'Tu web no es segura (sin HTTPS) — los navegadores avisan a tus visitantes',
  not_mobile_friendly: 'Tu web no se adapta al móvil — el 60% de búsquedas son desde smartphone',
  no_booking_or_whatsapp: 'No tienes reservas online ni botón de WhatsApp — pierdes contactos fuera de horario',
  low_rating: 'Tu nota en Google es baja — los clientes eligen a la competencia',
  unanswered_reviews: 'No respondes reseñas — transmites desinterés por tus clientes',
}

export function breakdownToProblems(breakdown: SignalBreakdown[]): string[] {
  return breakdown
    .filter((item) => item.fired && item.source !== 'unavailable')
    .map((item) => SIGNAL_TO_CLIENT_PROBLEM[item.signal as SignalKey])
    .filter((p): p is string => p !== undefined)
}

function opportunityLevel(score: number): string {
  if (score >= 60) return 'Oportunidad alta'
  if (score >= 30) return 'Oportunidad media'
  return 'Oportunidad baja'
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-ES').format(price) + ' €'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#18181b',
    padding: 0,
    paddingBottom: 60,
  },
  // Header
  headerBg: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 40,
    paddingVertical: 28,
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  headerDate: {
    fontSize: 9,
    color: '#93c5fd',
    textAlign: 'right',
    marginTop: 4,
  },
  businessName: {
    fontSize: 13,
    color: '#dbeafe',
  },
  // Body sections
  section: {
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1d4ed8',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#bfdbfe',
  },
  // Diagnosis box
  diagnosisBox: {
    backgroundColor: '#fffbeb',
    borderLeftWidth: 3,
    borderLeftColor: '#d97706',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  diagnosisScore: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#92400e',
    marginBottom: 4,
  },
  problemItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: {
    width: 12,
    fontSize: 9,
    color: '#d97706',
  },
  problemText: {
    flex: 1,
    fontSize: 9,
    color: '#52525b',
    lineHeight: 1.4,
  },
  // Solution
  solutionDesc: {
    fontSize: 9,
    color: '#52525b',
    lineHeight: 1.5,
    marginBottom: 10,
  },
  includeItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  checkmark: {
    width: 14,
    fontSize: 9,
    color: '#16a34a',
    fontFamily: 'Helvetica-Bold',
  },
  includeText: {
    flex: 1,
    fontSize: 9,
    color: '#18181b',
  },
  // Price
  priceBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 8,
  },
  priceBig: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#15803d',
  },
  priceRight: {
    flex: 1,
  },
  deliveryText: {
    fontSize: 10,
    color: '#18181b',
    marginBottom: 4,
  },
  legalNote: {
    fontSize: 8,
    color: '#a1a1aa',
    marginTop: 4,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e4e4e7',
    paddingTop: 8,
  },
  footerText: { fontSize: 8, color: '#a1a1aa' },
})

function ProposalDocument({ data }: { data: ProposalData }) {
  const included = [
    'Diseño y desarrollo web responsivo',
    'Formulario de contacto',
    'Optimización para Google',
    ...(data.includesHosting ? ['Hosting y dominio el primer año'] : []),
    ...(data.includesSeo ? ['SEO local básico'] : []),
  ]

  const contactParts = [
    data.freelancerName,
    data.freelancerEmail,
    data.freelancerPhone,
  ].filter(Boolean)

  return (
    <Document title={`Propuesta — ${data.businessName}`} author="My Client">
      <Page size="A4" style={styles.page}>
        {/* Cabecera */}
        <View style={styles.headerBg}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Propuesta de servicios web</Text>
            <Text style={styles.headerDate}>{formatDate(data.generatedAt)}</Text>
          </View>
          <Text style={styles.businessName}>{data.businessName}</Text>
          {data.businessAddress ? (
            <Text style={[styles.headerDate, { marginTop: 2 }]}>{data.businessAddress}</Text>
          ) : null}
        </View>

        {/* Diagnóstico */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>¿Por qué actuar ahora?</Text>
          <View style={styles.diagnosisBox}>
            <Text style={styles.diagnosisScore}>
              Índice de oportunidad: {data.totalScore}/100 — {opportunityLevel(data.totalScore)}
            </Text>
            {data.problems.map((problem, i) => (
              <View key={i} style={styles.problemItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.problemText}>{problem}</Text>
              </View>
            ))}
            {data.problems.length === 0 && (
              <Text style={styles.problemText}>
                Tu presencia online tiene margen de mejora para captar más clientes.
              </Text>
            )}
          </View>
        </View>

        {/* Solución */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{data.solutionTitle}</Text>
          <Text style={styles.solutionDesc}>{data.solutionDescription}</Text>
          {included.map((item, i) => (
            <View key={i} style={styles.includeItem}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.includeText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Precio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inversión</Text>
          <View style={styles.priceBox}>
            <Text style={styles.priceBig}>{formatPrice(data.price)}</Text>
            <View style={styles.priceRight}>
              <Text style={styles.deliveryText}>
                Entrega estimada: {data.deliveryWeeks} {data.deliveryWeeks === 1 ? 'semana' : 'semanas'}
              </Text>
            </View>
          </View>
          <Text style={styles.legalNote}>
            Precios sin IVA. Presupuesto válido 30 días.
          </Text>
        </View>

        {/* Pie */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{contactParts.join(' · ')}</Text>
          <Text style={styles.footerText}>Generado con My Client</Text>
        </View>
      </Page>
    </Document>
  )
}

export async function generateProposalPDF(data: ProposalData): Promise<Uint8Array> {
  const buffer = await renderToBuffer(<ProposalDocument data={data} />)
  return new Uint8Array(buffer)
}
