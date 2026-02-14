"use client"

import { ErrorDisplay } from "@/components/shared/ErrorDisplay"

export default function MembersError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorDisplay
      title="Failed to load members"
      message="Could not load organization members. Please try again."
      retry={reset}
    />
  )
}
