"use client"

import { ErrorDisplay } from "@/components/shared/ErrorDisplay"

export default function MainError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorDisplay retry={reset} />
}
