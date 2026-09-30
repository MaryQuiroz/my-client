import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildProspectsCsv } from '@/lib/metrics/csv'
import type { CsvRow } from '@/lib/metrics/csv'

export async function GET(request: NextRequest) {
  void request

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  type JoinRow = {
    status: string
    notes: string | null
    created_at: string
    businesses: {
      name: string
      address: string | null
      phone: string | null
      website: string | null
    } | null
  }

  const { data: rows } = await supabase
    .from('prospects')
    .select(`
      status,
      notes,
      created_at,
      businesses (
        name,
        address,
        phone,
        website
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .returns<JoinRow[]>()

  const csvRows: CsvRow[] = (rows ?? [])
    .filter((r) => r.businesses != null)
    .map((r) => ({
      name: r.businesses!.name,
      address: r.businesses!.address,
      phone: r.businesses!.phone,
      website: r.businesses!.website,
      status: r.status,
      notes: r.notes,
      created_at: r.created_at,
    }))

  const csv = buildProspectsCsv(csvRows)

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="prospectos.csv"',
    },
  })
}
