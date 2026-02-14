"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function ConnectButton({
  orgId,
  action,
  label,
  variant = "default",
}: {
  orgId: string
  action: (orgId: string) => Promise<{ error?: string; url?: string }>
  label: string
  variant?: "default" | "outline"
}) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const result = await action(orgId)
      if (result.error) {
        console.error(result.error)
        return
      }
      if (result.url) {
        window.location.href = result.url
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant={variant} disabled={loading} onClick={handleClick}>
      {loading ? "Redirecting..." : label}
    </Button>
  )
}
