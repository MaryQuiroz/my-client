import type { PageSpeedData } from './scorer'

interface LighthouseAudit {
  score: number | null
}

interface LighthouseResult {
  categories?: {
    performance?: { score: number | null }
  }
  audits?: {
    'mobile-friendly'?: LighthouseAudit
  }
}

interface PageSpeedResponse {
  lighthouseResult?: LighthouseResult
}

export async function fetchPageSpeed(
  url: string,
  apiKey?: string | null
): Promise<PageSpeedData | null> {
  try {
    const params = new URLSearchParams({
      url,
      strategy: 'mobile',
      category: 'performance',
    })
    if (apiKey) params.set('key', apiKey)

    const response = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`,
      { signal: AbortSignal.timeout(15_000) } // 15s timeout
    )

    if (!response.ok) return null

    const data = (await response.json()) as PageSpeedResponse
    const lighthouse = data.lighthouseResult

    if (!lighthouse) return null

    const perfScore = lighthouse.categories?.performance?.score
    const mobileFriendlyScore = lighthouse.audits?.['mobile-friendly']?.score

    return {
      performanceScore: perfScore != null ? Math.round(perfScore * 100) : 100,
      mobileFriendly: mobileFriendlyScore != null ? mobileFriendlyScore >= 0.9 : true,
    }
  } catch {
    // Timeout, red caída, URL inválida — devolver null sin lanzar
    return null
  }
}
