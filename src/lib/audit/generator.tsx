import {
  renderToBuffer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { SignalBreakdown } from '@/lib/scoring/scorer'
import type { Recommendation } from './recommendations'

export interface AuditData {
  businessName: string
  address: string
  totalScore: number
  breakdown: SignalBreakdown[]
  recommendations: Recommendation[]
  freelancerName: string
  generatedAt: string // ISO string
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#18181b',
    padding: 40,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  brand: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#3b82f6' },
  headerRight: { alignItems: 'flex-end' },
  businessName: { fontSize: 13, fontFamily: 'Helvetica-Bold' },
  address: { fontSize: 9, color: '#71717a', marginTop: 2 },
  date: { fontSize: 9, color: '#71717a', marginTop: 4 },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
    borderRadius: 6,
    padding: 16,
    marginBottom: 20,
    gap: 16,
  },
  scoreBig: { fontSize: 36, fontFamily: 'Helvetica-Bold' },
  scoreLabel: { fontSize: 10, color: '#71717a', marginTop: 2 },
  scoreCaption: { fontSize: 9, color: '#71717a', flex: 1 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    color: '#3b82f6',
  },
  table: { marginBottom: 20 },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    marginBottom: 2,
  },
  col1: { flex: 3, fontSize: 9 },
  col2: { flex: 1, fontSize: 9, textAlign: 'center' },
  col3: { flex: 1, fontSize: 9, textAlign: 'right' },
  colHeader: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#71717a' },
  statusFired: { color: '#dc2626', fontFamily: 'Helvetica-Bold' },
  statusOk: { color: '#16a34a' },
  statusNd: { color: '#a1a1aa' },
  recItem: { marginBottom: 10 },
  recTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  recDesc: { fontSize: 9, color: '#52525b', lineHeight: 1.4 },
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
  scoreColorRed: { color: '#dc2626' },
  scoreColorAmber: { color: '#d97706' },
  scoreColorGreen: { color: '#16a34a' },
  scoreSubtext: { fontSize: 16, color: '#a1a1aa' },
})

type ScoreColorKey = 'scoreColorRed' | 'scoreColorAmber' | 'scoreColorGreen'

function scoreColorKey(score: number): ScoreColorKey {
  if (score >= 60) return 'scoreColorRed'
  if (score >= 30) return 'scoreColorAmber'
  return 'scoreColorGreen'
}

type StatusKey = 'statusFired' | 'statusOk' | 'statusNd'

function signalStatus(item: SignalBreakdown): { label: string; styleKey: StatusKey } {
  if (item.source === 'unavailable') return { label: 'N/D', styleKey: 'statusNd' }
  if (item.fired) return { label: 'Detectado', styleKey: 'statusFired' }
  return { label: 'OK', styleKey: 'statusOk' }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function AuditDocument({ data }: { data: AuditData }) {
  return (
    <Document title={`Auditoría web — ${data.businessName}`} author="My Client">
      <Page size="A4" style={styles.page}>
        {/* Cabecera */}
        <View style={styles.header}>
          <Text style={styles.brand}>My Client</Text>
          <View style={styles.headerRight}>
            <Text style={styles.businessName}>{data.businessName}</Text>
            {data.address ? <Text style={styles.address}>{data.address}</Text> : null}
            <Text style={styles.date}>Auditoría del {formatDate(data.generatedAt)}</Text>
          </View>
        </View>

        {/* Puntuación */}
        <View style={styles.scoreSection}>
          <View>
            <Text style={[styles.scoreBig, styles[scoreColorKey(data.totalScore)]]}>
              {data.totalScore}
              <Text style={styles.scoreSubtext}>/100</Text>
            </Text>
            <Text style={styles.scoreLabel}>Índice de oportunidad</Text>
          </View>
          <Text style={styles.scoreCaption}>
            Cuanto mayor es la puntuación, más problemas web detectados y mayor la oportunidad
            de mejora. Una puntuación alta indica que el negocio se beneficiaría de una web
            profesional actualizada.
          </Text>
        </View>

        {/* Tabla de señales */}
        <Text style={styles.sectionTitle}>Análisis de señales</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.col1, styles.colHeader]}>Señal</Text>
            <Text style={[styles.col2, styles.colHeader]}>Estado</Text>
            <Text style={[styles.col3, styles.colHeader]}>Puntos</Text>
          </View>
          {data.breakdown.map((item) => {
            const st = signalStatus(item)
            return (
              <View key={item.signal} style={styles.tableRow}>
                <Text style={styles.col1}>{item.label}</Text>
                <Text style={[styles.col2, styles[st.styleKey]]}>{st.label}</Text>
                <Text style={styles.col3}>
                  {item.source === 'unavailable' ? '—' : `${item.points}/${item.maxPoints}`}
                </Text>
              </View>
            )
          })}
        </View>

        {/* Recomendaciones */}
        {data.recommendations.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recomendaciones</Text>
            {data.recommendations.map((rec) => (
              <View key={rec.signal} style={styles.recItem}>
                <Text style={styles.recTitle}>→ {rec.title}</Text>
                <Text style={styles.recDesc}>{rec.description}</Text>
              </View>
            ))}
          </>
        )}

        {/* Pie */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Auditoría generada con My Client</Text>
          <Text style={styles.footerText}>{data.freelancerName}</Text>
        </View>
      </Page>
    </Document>
  )
}

export async function generateAuditPDF(data: AuditData): Promise<Uint8Array> {
  const buffer = await renderToBuffer(<AuditDocument data={data} />)
  return new Uint8Array(buffer)
}
