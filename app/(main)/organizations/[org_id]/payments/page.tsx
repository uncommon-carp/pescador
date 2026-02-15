import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { getConnectAccount, syncConnectAccount } from "@/lib/stripe/connect"
import { ConnectButton } from "./_components/ConnectButton"
import { ConnectStatusCard } from "./_components/ConnectStatusCard"
import { createConnectAccount } from "@/actions/connect"
import { Landmark } from "lucide-react"
import type { ConnectStatus } from "@/types"

export default async function PaymentsPage({
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
    .select("id, name")
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

  const canManage = member.role === "owner" || member.role === "admin"
  let connectAccount = await getConnectAccount(org_id, supabase)

  // Sync from Stripe if the account exists but onboarding isn't marked complete
  if (connectAccount && !connectAccount.charges_enabled) {
    connectAccount = (await syncConnectAccount(org_id, supabase)) ?? connectAccount
  }

  let status: ConnectStatus = "not_connected"
  if (connectAccount) {
    status = connectAccount.charges_enabled ? "active" : "onboarding"
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-8">
      <PageHeader title="Payments" description={org.name} />

      {status === "not_connected" && (
        <EmptyState
          icon={Landmark}
          title="Connect your Stripe account"
          description="Connect a Stripe account to start accepting payments from clients for bookings and trips."
        >
          {canManage && (
            <ConnectButton
              orgId={org_id}
              action={createConnectAccount}
              label="Connect Stripe"
            />
          )}
        </EmptyState>
      )}

      {status !== "not_connected" && (
        <ConnectStatusCard
          status={status}
          payoutsEnabled={connectAccount?.payouts_enabled ?? false}
          orgId={org_id}
          canManage={canManage}
        />
      )}

      {!canManage && status === "not_connected" && (
        <p className="text-muted-foreground text-sm">
          Contact an organization owner or admin to connect a payment account.
        </p>
      )}
    </div>
  )
}
