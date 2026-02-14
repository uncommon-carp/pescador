"use client"

import { ErrorDisplay } from "@/components/shared/ErrorDisplay"

export default function SettingsError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorDisplay
      title="Failed to load settings"
      message="Could not load organization settings. Please try again."
      retry={reset}
    />
  )
}
