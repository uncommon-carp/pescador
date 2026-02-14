import type { SupabaseClient } from "@supabase/supabase-js"

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
