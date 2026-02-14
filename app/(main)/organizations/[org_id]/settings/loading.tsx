import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <div className="mx-auto grid max-w-2xl gap-8">
      <div>
        <Skeleton className="h-8 w-52" />
        <Skeleton className="mt-2 h-4 w-36" />
      </div>
      <div className="grid gap-4 rounded-lg border p-6">
        <div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-2 h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-16" />
          <Skeleton className="mt-2 h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  )
}
