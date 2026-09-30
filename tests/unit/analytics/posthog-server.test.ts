import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCapture = vi.fn()
const mockFlush = vi.fn().mockResolvedValue(undefined)

vi.mock('posthog-node', () => ({
  PostHog: vi.fn(function () {
    return { capture: mockCapture, flush: mockFlush }
  }),
}))

describe('captureEvent (posthog-server)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('no lanza si NEXT_PUBLIC_POSTHOG_KEY no está configurada', async () => {
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY
    const { captureEvent } = await import('@/lib/analytics/posthog-server')
    await expect(captureEvent('user-1', 'test_event')).resolves.toBeUndefined()
    expect(mockCapture).not.toHaveBeenCalled()
  })

  it('envía el evento con userId y propiedades cuando hay clave configurada', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test'
    const { captureEvent } = await import('@/lib/analytics/posthog-server')
    await captureEvent('user-42', 'search_performed', { results_count: 5 })
    expect(mockCapture).toHaveBeenCalledWith({
      distinctId: 'user-42',
      event: 'search_performed',
      properties: { results_count: 5 },
    })
    expect(mockFlush).toHaveBeenCalled()
  })

  it('envía el evento sin propiedades opcionales', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test'
    const { captureEvent } = await import('@/lib/analytics/posthog-server')
    await captureEvent('user-7', 'audit_generated')
    expect(mockCapture).toHaveBeenCalledWith({
      distinctId: 'user-7',
      event: 'audit_generated',
      properties: undefined,
    })
  })
})
