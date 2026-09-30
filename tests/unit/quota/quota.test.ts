import { describe, it, expect } from 'vitest'
import { checkQuota } from '@/lib/quota'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

function makeSubMock(planRow: { plan: string } | null) {
  return {
    select: () => ({
      eq: () => ({
        maybeSingle: () => Promise.resolve({ data: planRow, error: null }),
      }),
    }),
  }
}

function makeUsageMock(count: number) {
  return {
    select: () => ({
      eq: () => ({
        eq: () => ({
          gte: () => Promise.resolve({ count, error: null }),
        }),
      }),
    }),
  }
}

function makeAdminMock(planRow: { plan: string } | null, usageCount: number) {
  return {
    from: (table: string) => {
      if (table === 'subscriptions') return makeSubMock(planRow)
      return makeUsageMock(usageCount)
    },
  } as unknown as SupabaseClient<Database>
}

describe('checkQuota', () => {
  it('plan free, 0 usos → allowed:true, used:0, limit:5', async () => {
    const result = await checkQuota('u1', 'search', makeAdminMock({ plan: 'free' }, 0))
    expect(result).toEqual({ allowed: true, used: 0, limit: 5, plan: 'free' })
  })

  it('plan free, 4 búsquedas → allowed:true', async () => {
    const result = await checkQuota('u1', 'search', makeAdminMock({ plan: 'free' }, 4))
    expect(result.allowed).toBe(true)
    expect(result.used).toBe(4)
  })

  it('plan free, 5 búsquedas (= límite) → allowed:false', async () => {
    const result = await checkQuota('u1', 'search', makeAdminMock({ plan: 'free' }, 5))
    expect(result.allowed).toBe(false)
    expect(result.used).toBe(5)
    expect(result.limit).toBe(5)
  })

  it('plan pro, 100 búsquedas (= límite) → allowed:false', async () => {
    const result = await checkQuota('u1', 'search', makeAdminMock({ plan: 'pro' }, 100))
    expect(result.allowed).toBe(false)
    expect(result.limit).toBe(100)
    expect(result.plan).toBe('pro')
  })

  it('sin fila en subscriptions → cae a plan free', async () => {
    const result = await checkQuota('u1', 'search', makeAdminMock(null, 0))
    expect(result.plan).toBe('free')
    expect(result.limit).toBe(5)
  })

  it('action audit usa auditsPerMonth (free=3)', async () => {
    const result = await checkQuota('u1', 'audit', makeAdminMock({ plan: 'free' }, 3))
    expect(result.allowed).toBe(false)
    expect(result.limit).toBe(3)
  })

  it('action message usa messagesPerMonth (free=10)', async () => {
    const result = await checkQuota('u1', 'message', makeAdminMock({ plan: 'free' }, 9))
    expect(result.allowed).toBe(true)
    expect(result.limit).toBe(10)
  })
})
