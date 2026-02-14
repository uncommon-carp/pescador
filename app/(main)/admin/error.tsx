"use client"

import { ErrorDisplay } from "@/components/shared/ErrorDisplay"

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorDisplay
      title="Failed to load admin dashboard"
      message="Could not load admin data. Please try again."
      retry={reset}
    />
  )
}
