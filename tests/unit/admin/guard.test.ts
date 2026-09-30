import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))

// Importar DESPUÉS del mock para que se aplique
const { requireAdmin } = await import('@/lib/admin/guard')

function makeAdminMock(found: boolean) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () =>
            Promise.resolve({ data: found ? { id: 'admin-123' } : null, error: null }),
        }),
      }),
    }),
  } as unknown as SupabaseClient<Database>
}

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('usuario en admin_users → no redirige', async () => {
    const admin = makeAdminMock(true)
    await expect(requireAdmin('admin-123', admin)).resolves.toBeUndefined()
  })

  it('usuario NO en admin_users → redirige a /dashboard', async () => {
    const admin = makeAdminMock(false)
    await expect(requireAdmin('user-456', admin)).rejects.toThrow('REDIRECT:/dashboard')
  })

  it('usuario vacío → redirige a /dashboard', async () => {
    const admin = makeAdminMock(false)
    await expect(requireAdmin('', admin)).rejects.toThrow('REDIRECT:/dashboard')
  })
})
