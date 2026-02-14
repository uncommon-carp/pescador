import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="grid gap-6">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-60" />
      </div>
      <div className="rounded-lg border">
        <div className="p-6">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <div className="flex gap-2 px-6 pb-6">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>
    </div>
  )
}
