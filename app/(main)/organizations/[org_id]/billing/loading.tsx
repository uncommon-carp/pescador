import { Skeleton } from "@/components/ui/skeleton"

export default function BillingLoading() {
  return (
    <div className="mx-auto grid max-w-4xl gap-8">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-32" />
      </div>
      <div className="rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-2 h-4 w-24" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-6">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="mt-2 h-8 w-24" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-44" />
            </div>
            <Skeleton className="mt-6 h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
