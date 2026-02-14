"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

export function Pagination({
  basePath,
  page,
  totalPages,
}: {
  basePath: string
  page: number
  totalPages: number
}) {
  const searchParams = useSearchParams()

  function buildHref(targetPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(targetPage))
    return `${basePath}?${params.toString()}`
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between">
      <p className="text-muted-foreground text-sm">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          asChild={page > 1}
          disabled={page <= 1}
        >
          {page > 1 ? (
            <Link href={buildHref(page - 1)}>Previous</Link>
          ) : (
            "Previous"
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild={page < totalPages}
          disabled={page >= totalPages}
        >
          {page < totalPages ? (
            <Link href={buildHref(page + 1)}>Next</Link>
          ) : (
            "Next"
          )}
        </Button>
      </div>
    </div>
  )
}
