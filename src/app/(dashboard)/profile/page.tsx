import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfilePageClient } from './ProfilePageClient'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users_profile')
    .select('*')
    .eq('id', user.id)
    .single()

  return <ProfilePageClient profile={profile} />
}
