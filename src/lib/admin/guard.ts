import { redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export async function requireAdmin(
  userId: string,
  adminClient: SupabaseClient<Database>
): Promise<void> {
  const { data } = await adminClient
    .from('admin_users')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  if (!data) redirect('/dashboard')
}
