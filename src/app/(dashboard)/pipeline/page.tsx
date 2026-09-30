import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import KanbanBoard from '@/components/kanban/KanbanBoard'
import type { ProspectWithBusiness } from '@/lib/kanban/utils'

export default async function PipelinePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  type JoinRow = {
    id: string
    status: string
    notes: string | null
    next_contact_at: string | null
    contacted_at: string | null
    created_at: string
    businesses: {
      id: string
      name: string
      address: string | null
      website: string | null
      phone: string | null
    } | null
  }

  const { data: rows } = await supabase
    .from('prospects')
    .select(`
      id,
      status,
      notes,
      next_contact_at,
      contacted_at,
      created_at,
      businesses (
        id,
        name,
        address,
        website,
        phone
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .returns<JoinRow[]>()

  const prospects: ProspectWithBusiness[] = (rows ?? [])
    .filter((r) => r.businesses != null)
    .map((r) => ({
      id: r.id,
      status: r.status as ProspectWithBusiness['status'],
      notes: r.notes,
      next_contact_at: r.next_contact_at,
      contacted_at: r.contacted_at,
      created_at: r.created_at,
      business: {
        id: r.businesses!.id,
        name: r.businesses!.name,
        address: r.businesses!.address,
        website: r.businesses!.website,
        phone: r.businesses!.phone,
      },
    }))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-zinc-900">Pipeline</h1>
      <KanbanBoard initialProspects={prospects} />
    </div>
  )
}
