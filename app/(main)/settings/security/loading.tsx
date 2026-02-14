import { Skeleton } from "@/components/ui/skeleton"

export default function SecurityLoading() {
  return (
    <>
      <div>
        <Skeleton className="h-8 w-28" />
        <Skeleton className="mt-2 h-4 w-40" />
      </div>
      <div className="grid gap-4 rounded-lg border p-6">
        <Skeleton className="h-5 w-32" />
        <div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-2 h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-2 h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
    </>
  )
}
