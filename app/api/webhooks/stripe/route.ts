import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { stripe } from "@/lib/stripe/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { stripePlans, type PlanKey } from "@/config/stripe"
import { siteConfig } from "@/config/site"
import { sendEmail } from "@/lib/email"
import { ReceiptEmail } from "@/emails/receipt"
import { TrialEndingEmail } from "@/emails/trial-ending"

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Webhook signature verification failed:", message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const orgId = session.metadata?.organization_id
        if (!orgId || !session.subscription) break

        // Retrieve the subscription to determine the plan
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )
        const priceId = subscription.items.data[0]?.price.id
        const plan = getPlanByPriceId(priceId)

        await supabase
          .from("organizations")
          .update({
            stripe_subscription_id: subscription.id,
            subscription_status:
              subscription.status === "trialing" ? "trialing" : "active",
            subscription_plan: plan,
            trial_ends_at: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
          })
          .eq("id", orgId)

        // Send receipt email
        const customerEmail = session.customer_details?.email
        if (customerEmail && plan !== "free") {
          const { data: org } = await supabase
            .from("organizations")
            .select("name")
            .eq("id", orgId)
            .single()
          const planConfig = stripePlans[plan as PlanKey]
          if (org && planConfig) {
            sendEmail({
              to: customerEmail,
              subject: "Payment Confirmed",
              react: ReceiptEmail({
                orgName: org.name,
                planName: planConfig.name,
                amount: `$${planConfig.price}`,
              }),
            })
          }
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const orgId = subscription.metadata?.organization_id
        if (!orgId) break

        const priceId = subscription.items.data[0]?.price.id
        const plan = getPlanByPriceId(priceId)

        await supabase
          .from("organizations")
          .update({
            subscription_status: mapStripeStatus(subscription.status),
            subscription_plan: plan,
            trial_ends_at: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
          })
          .eq("id", orgId)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const orgId = subscription.metadata?.organization_id
        if (!orgId) break

        await supabase
          .from("organizations")
          .update({
            stripe_subscription_id: null,
            subscription_status: "free",
            subscription_plan: "free",
            trial_ends_at: null,
          })
          .eq("id", orgId)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const subDetails = invoice.parent?.subscription_details
        if (!subDetails?.subscription) break

        const subscriptionId =
          typeof subDetails.subscription === "string"
            ? subDetails.subscription
            : subDetails.subscription.id
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const orgId = subscription.metadata?.organization_id
        if (!orgId) break

        await supabase
          .from("organizations")
          .update({ subscription_status: "past_due" })
          .eq("id", orgId)
        break
      }

      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription
        const orgId = subscription.metadata?.organization_id
        if (!orgId || !subscription.trial_end) break

        const { data: org } = await supabase
          .from("organizations")
          .select("name")
          .eq("id", orgId)
          .single()
        if (!org) break

        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id
        const customer = await stripe.customers.retrieve(customerId)
        if (customer.deleted || !("email" in customer) || !customer.email) break

        const daysRemaining = Math.max(
          0,
          Math.ceil(
            (subscription.trial_end * 1000 - Date.now()) / (1000 * 60 * 60 * 24)
          )
        )

        sendEmail({
          to: customer.email,
          subject: `Your trial for ${org.name} ends in ${daysRemaining} days`,
          react: TrialEndingEmail({
            orgName: org.name,
            daysRemaining,
            billingUrl: `${siteConfig.url}/organizations/${orgId}/billing`,
          }),
        })
        break
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err)
    // Return 200 anyway to prevent Stripe retries for processing errors
  }

  return NextResponse.json({ received: true })
}

// Map a Stripe price ID back to our plan key
function getPlanByPriceId(priceId: string): string {
  for (const [key, plan] of Object.entries(stripePlans)) {
    if (plan.priceId === priceId) return key as PlanKey
  }
  return "free"
}

// Map Stripe subscription status to our status type
function mapStripeStatus(status: Stripe.Subscription.Status): string {
  switch (status) {
    case "trialing":
      return "trialing"
    case "active":
      return "active"
    case "past_due":
      return "past_due"
    case "canceled":
      return "canceled"
    case "unpaid":
      return "unpaid"
    default:
      return "free"
  }
}
