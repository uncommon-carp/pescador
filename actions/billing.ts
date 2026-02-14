"use server"

import { createServerClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe/server"
import { stripePlans } from "@/config/stripe"
import { checkoutSchema } from "@/lib/validations/billing"
import { getOrigin } from "@/lib/origin"

// ─── Create Checkout Session ──────────────────────────────

export async function createCheckoutSession(orgId: string, planKey: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Validate plan key
  const parsed = checkoutSchema.safeParse({ planKey })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  // Verify user is owner or admin of the org
  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single()

  if (!member || (member.role !== "owner" && member.role !== "admin")) {
    return { error: "Only owners and admins can manage billing" }
  }

  // Get org with billing info
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, stripe_customer_id")
    .eq("id", orgId)
    .single()

  if (!org) return { error: "Organization not found" }

  // Look up or create Stripe customer
  let customerId = org.stripe_customer_id as string | null
  if (!customerId) {
    const customer = await stripe.customers.create({
      name: org.name,
      email: user.email,
      metadata: { organization_id: org.id },
    })
    customerId = customer.id

    await supabase
      .from("organizations")
      .update({ stripe_customer_id: customerId })
      .eq("id", orgId)
  }

  // Build success/cancel URLs
  const origin = await getOrigin()
  const billingUrl = `${origin}/organizations/${orgId}/billing`

  const plan = stripePlans[parsed.data.planKey]

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${billingUrl}?success=true`,
    cancel_url: `${billingUrl}?canceled=true`,
    metadata: { organization_id: orgId },
    subscription_data: {
      metadata: { organization_id: orgId },
    },
  })

  return { url: session.url }
}

// ─── Create Portal Session ────────────────────────────────

export async function createPortalSession(orgId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Verify user is owner or admin
  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single()

  if (!member || (member.role !== "owner" && member.role !== "admin")) {
    return { error: "Only owners and admins can manage billing" }
  }

  // Get org's Stripe customer ID
  const { data: org } = await supabase
    .from("organizations")
    .select("stripe_customer_id")
    .eq("id", orgId)
    .single()

  if (!org?.stripe_customer_id) {
    return { error: "No billing account found" }
  }

  const origin = await getOrigin()
  const returnUrl = `${origin}/organizations/${orgId}/billing`

  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripe_customer_id as string,
    return_url: returnUrl,
  })

  return { url: session.url }
}
