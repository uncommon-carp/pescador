"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createPortalSession } from "@/actions/billing"

export function ManageSubscriptionButton({ orgId }: { orgId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleManage() {
    setLoading(true)
    try {
      const result = await createPortalSession(orgId)
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
    <Button variant="outline" disabled={loading} onClick={handleManage}>
      {loading ? "Redirecting..." : "Manage Subscription"}
    </Button>
  )
}
