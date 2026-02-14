import { Badge } from "@/components/ui/badge"
import { connectStatusConfig } from "@/config/stripe"
import { ConnectButton } from "./ConnectButton"
import {
  createConnectAccountLink,
  createConnectDashboardLink,
} from "@/actions/connect"
import type { ConnectStatus } from "@/types"

export function ConnectStatusCard({
  status,
  payoutsEnabled,
  orgId,
  canManage,
}: {
  status: ConnectStatus
  payoutsEnabled: boolean
  orgId: string
  canManage: boolean
}) {
  const config = connectStatusConfig[status]

  return (
    <div className="rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Payment Status</h2>
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>

          {status === "onboarding" && (
            <p className="text-muted-foreground mt-1 text-sm">
              Complete your Stripe onboarding to start accepting payments from
              clients.
            </p>
          )}

          {status === "active" && (
            <div className="mt-1 space-y-1">
              <p className="text-muted-foreground text-sm">
                Your account is ready to accept payments.
              </p>
              {!payoutsEnabled && (
                <p className="text-muted-foreground text-sm">
                  Payouts are pending — Stripe may need additional verification
                  before funds can be sent to your bank account.
                </p>
              )}
            </div>
          )}
        </div>

        {canManage && status === "onboarding" && (
          <ConnectButton
            orgId={orgId}
            action={createConnectAccountLink}
            label="Continue Setup"
            variant="outline"
          />
        )}

        {canManage && status === "active" && (
          <ConnectButton
            orgId={orgId}
            action={createConnectDashboardLink}
            label="Stripe Dashboard"
            variant="outline"
          />
        )}
      </div>
    </div>
  )
}
