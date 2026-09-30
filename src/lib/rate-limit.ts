import { LRUCache } from 'lru-cache'

const WINDOW_MS = 60 * 1000 // 60 segundos
const MAX_REQUESTS = 10

interface WindowEntry {
  timestamps: number[]
}

const cache = new LRUCache<string, WindowEntry>({
  max: 10_000,
  ttl: WINDOW_MS,
})

export function checkRateLimit(userId: string): { success: boolean; remaining: number } {
  const now = Date.now()
  const entry = cache.get(userId) ?? { timestamps: [] }

  const recent = entry.timestamps.filter((t) => now - t < WINDOW_MS)

  if (recent.length >= MAX_REQUESTS) {
    return { success: false, remaining: 0 }
  }

  recent.push(now)
  cache.set(userId, { timestamps: recent })

  return { success: true, remaining: MAX_REQUESTS - recent.length }
}
