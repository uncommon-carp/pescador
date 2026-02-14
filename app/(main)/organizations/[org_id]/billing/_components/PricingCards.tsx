"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { stripePlans, type PlanKey } from "@/config/stripe"
import { createCheckoutSession } from "@/actions/billing"
import { Check } from "lucide-react"
import type { SubscriptionStatus } from "@/types"

export function PricingCards({
  orgId,
  currentPlan,
  currentStatus,
}: {
  orgId: string
  currentPlan: string
  currentStatus: SubscriptionStatus
}) {
  const [loading, setLoading] = useState<PlanKey | null>(null)

  async function handleSubscribe(planKey: PlanKey) {
    setLoading(planKey)
    try {
      const result = await createCheckoutSession(orgId, planKey)
      if (result.error) {
        console.error(result.error)
        return
      }
      if (result.url) {
        window.location.href = result.url
      }
    } finally {
      setLoading(null)
    }
  }

  const isActive = currentStatus === "active" || currentStatus === "trialing"

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {(
        Object.entries(stripePlans) as [
          PlanKey,
          (typeof stripePlans)[PlanKey],
        ][]
      ).map(([key, plan]) => {
        const isCurrent = isActive && currentPlan === key
        return (
          <div
            key={key}
            className={`rounded-lg border p-6 ${isCurrent ? "border-primary" : ""}`}
          >
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="mt-2 text-3xl font-bold">
              ${plan.price}
              <span className="text-muted-foreground text-sm font-normal">
                /mo
              </span>
            </p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="text-primary size-4" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className="mt-6 w-full"
              variant={isCurrent ? "outline" : "default"}
              disabled={isCurrent || loading !== null}
              onClick={() => handleSubscribe(key)}
            >
              {loading === key
                ? "Redirecting..."
                : isCurrent
                  ? "Current Plan"
                  : "Subscribe"}
            </Button>
          </div>
        )
      })}
    </div>
  )
}
