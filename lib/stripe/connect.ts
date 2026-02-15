import type { SupabaseClient } from "@supabase/supabase-js"
import { stripe } from "@/lib/stripe/server"

export async function getConnectAccount(orgId: string, supabase: SupabaseClient) {
  const { data } = await supabase
    .from("stripe_connect_accounts")
    .select("*")
    .eq("organization_id", orgId)
    .single()

  return data
}

export async function isConnectReady(orgId: string, supabase: SupabaseClient) {
  const account = await getConnectAccount(orgId, supabase)
  return account?.charges_enabled === true
}

/**
 * Sync connect account status from Stripe to the database.
 * Returns the updated local record, or null if no account exists.
 */
export async function syncConnectAccount(orgId: string, supabase: SupabaseClient) {
  const local = await getConnectAccount(orgId, supabase)
  if (!local) return null

  const remote = await stripe.accounts.retrieve(local.stripe_account_id)

  const details_submitted = remote.details_submitted ?? false
  const charges_enabled = remote.charges_enabled ?? false
  const payouts_enabled = remote.payouts_enabled ?? false

  // Skip the write if nothing changed
  if (
    local.details_submitted === details_submitted &&
    local.charges_enabled === charges_enabled &&
    local.payouts_enabled === payouts_enabled
  ) {
    return local
  }

  const { data } = await supabase
    .from("stripe_connect_accounts")
    .update({ details_submitted, charges_enabled, payouts_enabled })
    .eq("id", local.id)
    .select("*")
    .single()

  return data
}
