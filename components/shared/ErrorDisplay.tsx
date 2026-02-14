"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ErrorDisplay({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  retry,
}: {
  title?: string
  message?: string
  retry?: () => void
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
      <div className="bg-destructive/10 flex size-12 items-center justify-center rounded-full">
        <AlertCircle className="text-destructive size-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">{message}</p>
      {retry && (
        <Button onClick={retry} variant="outline" className="mt-6">
          Try again
        </Button>
      )}
    </div>
  )
}
