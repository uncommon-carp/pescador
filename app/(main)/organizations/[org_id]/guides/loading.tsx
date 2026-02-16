import { Skeleton } from "@/components/ui/skeleton"

export default function GuidesLoading() {
  return (
    <div className="mx-auto grid max-w-4xl gap-8">
      <div className="flex items-center justify-between">
        <div className="grid gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
