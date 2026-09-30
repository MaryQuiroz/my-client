import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkQuota } from '@/lib/quota'
import ProspectingClient from './ProspectingClient'

export default async function ProspectingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const initialSearchQuota = await checkQuota(user.id, 'search', admin)

  return <ProspectingClient initialSearchQuota={initialSearchQuota} />
}
