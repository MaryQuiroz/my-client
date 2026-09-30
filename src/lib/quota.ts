import type { SupabaseClient } from '@supabase/supabase-js'
import { PLAN_LIMITS, DEFAULT_PLAN, type PlanId, type PlanLimits } from '@/lib/stripe/config'
import type { Database } from '@/types/database'

export type QuotaAction = 'search' | 'audit' | 'message'

export interface QuotaResult {
  allowed: boolean
  used: number
  limit: number
  plan: PlanId
}

const ACTION_LIMIT_KEY: Record<QuotaAction, keyof PlanLimits> = {
  search: 'searchesPerMonth',
  audit: 'auditsPerMonth',
  message: 'messagesPerMonth',
}

export async function checkQuota(
  userId: string,
  action: QuotaAction,
  adminClient: SupabaseClient<Database>
): Promise<QuotaResult> {
  const { data: subscription } = await adminClient
    .from('subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .maybeSingle()

  const plan = (subscription?.plan ?? DEFAULT_PLAN) as PlanId
  const limit = PLAN_LIMITS[plan][ACTION_LIMIT_KEY[action]]

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count } = await adminClient
    .from('usage_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action', action)
    .gte('created_at', startOfMonth.toISOString())

  const used = count ?? 0
  return { allowed: used < limit, used, limit, plan }
}
