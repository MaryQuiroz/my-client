import { PostHog } from 'posthog-node'

let _client: PostHog | null = null

function getClient(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com'
  if (!key) return null
  if (!_client) {
    _client = new PostHog(key, { host, flushAt: 1, flushInterval: 0 })
  }
  return _client
}

export async function captureEvent(
  userId: string,
  event: string,
  properties?: Record<string, unknown>
): Promise<void> {
  const client = getClient()
  if (!client) return

  client.capture({ distinctId: userId, event, properties })
  await client.flush()
}
