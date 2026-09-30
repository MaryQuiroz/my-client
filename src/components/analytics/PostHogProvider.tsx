'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initPostHog, posthog } from '@/lib/analytics/posthog-client'

interface PostHogProviderProps {
  children: React.ReactNode
  userId?: string
  userEmail?: string
}

export function PostHogProvider({ children, userId, userEmail }: PostHogProviderProps) {
  const pathname = usePathname()

  useEffect(() => {
    initPostHog()
  }, [])

  useEffect(() => {
    if (!userId) return
    posthog.identify(userId, { email: userEmail })
  }, [userId, userEmail])

  useEffect(() => {
    posthog.capture('$pageview', { $current_url: pathname })
  }, [pathname])

  return <>{children}</>
}
