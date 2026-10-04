export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 rounded-md bg-zinc-200 animate-pulse" />
      <div className="h-32 rounded-lg bg-zinc-200 animate-pulse" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 rounded-lg bg-zinc-200 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
