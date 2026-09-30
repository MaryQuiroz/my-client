import Link from 'next/link'

interface UpgradeGateProps {
  allowed: boolean
  used: number
  limit: number
  action: string
  className?: string
  children: React.ReactNode
}

export default function UpgradeGate({
  allowed,
  used,
  limit,
  action,
  className,
  children,
}: UpgradeGateProps) {
  if (allowed) return <>{children}</>

  return (
    <div className={`relative ${className ?? ''}`}>
      <div className="pointer-events-none select-none opacity-30">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-md bg-white/90 p-3 text-center backdrop-blur-sm">
        <svg
          className="h-5 w-5 text-zinc-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <p className="text-xs text-zinc-600">
          Límite de {action}s alcanzado ({used}/{limit} este mes)
        </p>
        <Link
          href="/upgrade"
          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Ver planes
        </Link>
      </div>
    </div>
  )
}
