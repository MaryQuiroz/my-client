export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="h-8 w-32 rounded-md bg-zinc-200 animate-pulse" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-32 rounded-lg bg-zinc-200 animate-pulse" />
      ))}
    </div>
  )
}
