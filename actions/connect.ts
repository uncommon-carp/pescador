"use server"

import { createServerClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe/server"
import { getConnectAccount } from "@/lib/stripe/connect"
import { connectOrgSchema } from "@/lib/validations/connect"
import { getOrigin } from "@/lib/origin"

// ─── Create Connect Account ─────────────────────────────

export async function createConnectAccount(orgId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const parsed = connectOrgSchema.safeParse({ orgId })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  // Verify user is owner or admin of the org
  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single()

  if (!member || (member.role !== "owner" && member.role !== "admin")) {
    return { error: "Only owners and admins can manage payments" }
  }

  // Verify org doesn't already have a Connect account
  const existing = await getConnectAccount(orgId, supabase)
  if (existing) return { error: "Connect account already exists" }

  // Get org details for prefill
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("id", orgId)
    .single()

  if (!org) return { error: "Organization not found" }

  // Create the Express account
  const account = await stripe.accounts.create({
    type: "express",
    metadata: { organization_id: orgId },
    business_profile: {
      name: org.name,
    },
    email: user.email,
  })

  // Insert the row into our database
  const { error: insertError } = await supabase
    .from("stripe_connect_accounts")
    .insert({
      organization_id: orgId,
      stripe_account_id: account.id,
    })

  if (insertError) {
    console.error("Failed to insert Connect account:", insertError)
    return { error: "Failed to save Connect account" }
  }

  // Generate an Account Link for onboarding
  const origin = await getOrigin()
  const paymentsUrl = `${origin}/organizations/${orgId}/payments`

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    type: "account_onboarding",
    return_url: paymentsUrl,
    refresh_url: paymentsUrl,
  })

  return { url: accountLink.url }
}

// ─── Create Connect Account Link ────────────────────────

export async function createConnectAccountLink(orgId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const parsed = connectOrgSchema.safeParse({ orgId })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  // Verify user is owner or admin
  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single()

  if (!member || (member.role !== "owner" && member.role !== "admin")) {
    return { error: "Only owners and admins can manage payments" }
  }

  // Look up existing Connect account
  const account = await getConnectAccount(orgId, supabase)
  if (!account) return { error: "No Connect account found" }

  const origin = await getOrigin()
  const paymentsUrl = `${origin}/organizations/${orgId}/payments`

  const accountLink = await stripe.accountLinks.create({
    account: account.stripe_account_id,
    type: "account_onboarding",
    return_url: paymentsUrl,
    refresh_url: paymentsUrl,
  })

  return { url: accountLink.url }
}

// ─── Create Connect Dashboard Link ──────────────────────

export async function createConnectDashboardLink(orgId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const parsed = connectOrgSchema.safeParse({ orgId })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  // Verify user is owner or admin
  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single()

  if (!member || (member.role !== "owner" && member.role !== "admin")) {
    return { error: "Only owners and admins can manage payments" }
  }

  // Look up existing Connect account
  const account = await getConnectAccount(orgId, supabase)
  if (!account) return { error: "No Connect account found" }

  const loginLink = await stripe.accounts.createLoginLink(
    account.stripe_account_id
  )

  return { url: loginLink.url }
}
