"use client"

import { ErrorDisplay } from "@/components/shared/ErrorDisplay"

export default function BillingError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorDisplay
      title="Failed to load billing"
      message="Could not load billing information. Please try again."
      retry={reset}
    />
  )
}
