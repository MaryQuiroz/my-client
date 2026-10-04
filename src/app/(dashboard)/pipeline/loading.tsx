export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-32 rounded-md bg-zinc-200 animate-pulse" />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-64 shrink-0 h-96 rounded-lg bg-zinc-200 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
