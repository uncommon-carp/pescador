import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/PageHeader"
import { PricingCards } from "./_components/PricingCards"
import { ManageSubscriptionButton } from "./_components/ManageSubscriptionButton"
import { freePlan, stripePlans, subscriptionStatusConfig } from "@/config/stripe"
import { Badge } from "@/components/ui/badge"
import type { SubscriptionStatus } from "@/types"

export default async function BillingPage({
  params,
}: {
  params: Promise<{ org_id: string }>
}) {
  const { org_id } = await params
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: org } = await supabase
    .from("organizations")
    .select(
      "id, name, subscription_status, subscription_plan, stripe_customer_id, trial_ends_at"
    )
    .eq("id", org_id)
    .single()

  if (!org) notFound()

  // Check user's role
  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", org_id)
    .eq("user_id", user!.id)
    .single()

  if (!member) notFound()

  const canManageBilling = member.role === "owner" || member.role === "admin"
  const status = (org.subscription_status || "free") as SubscriptionStatus
  const plan = (org.subscription_plan || "free") as string
  const hasSubscription = status !== "free"

  const currentPlan =
    plan !== "free" && plan in stripePlans
      ? stripePlans[plan as keyof typeof stripePlans]
      : freePlan

  return (
    <div className="mx-auto grid max-w-4xl gap-8">
      <PageHeader title="Plans & Billing" description={org.name} />

      {/* Current plan card */}
      <div className="rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Current Plan</h2>
              <Badge variant={subscriptionStatusConfig[status].variant}>
                {subscriptionStatusConfig[status].label}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {currentPlan.name} &mdash; ${currentPlan.price}/mo
            </p>
            {status === "trialing" && org.trial_ends_at && (
              <p className="text-muted-foreground mt-1 text-sm">
                Trial ends{" "}
                {new Date(org.trial_ends_at as string).toLocaleDateString()}
              </p>
            )}
            {status === "past_due" && (
              <p className="text-destructive mt-1 text-sm">
                Your payment is past due. Please update your payment method.
              </p>
            )}
          </div>
          {hasSubscription && canManageBilling && (
            <ManageSubscriptionButton orgId={org_id} />
          )}
        </div>
      </div>

      {/* Pricing cards (show when free, or allow upgrades) */}
      {canManageBilling && (
        <PricingCards
          orgId={org_id}
          currentPlan={plan}
          currentStatus={status}
        />
      )}

      {!canManageBilling && !hasSubscription && (
        <p className="text-muted-foreground text-sm">
          Contact an organization owner or admin to manage billing.
        </p>
      )}
    </div>
  )
}
