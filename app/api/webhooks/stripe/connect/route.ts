import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { stripe } from "@/lib/stripe/server"
import { createAdminClient } from "@/lib/supabase/admin"

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
      process.env.STRIPE_CONNECT_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Connect webhook signature verification failed:", message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case "account.updated": {
        const accountId = event.account
        if (!accountId) break

        // Look up our record
        const { data: connectAccount } = await supabase
          .from("stripe_connect_accounts")
          .select("id")
          .eq("stripe_account_id", accountId)
          .single()

        if (!connectAccount) break

        // Retrieve the full account from Stripe
        const account = await stripe.accounts.retrieve(accountId)

        await supabase
          .from("stripe_connect_accounts")
          .update({
            details_submitted: account.details_submitted ?? false,
            charges_enabled: account.charges_enabled ?? false,
            payouts_enabled: account.payouts_enabled ?? false,
          })
          .eq("stripe_account_id", accountId)

        break
      }
    }
  } catch (err) {
    console.error("Connect webhook handler error:", err)
    // Return 200 anyway to prevent Stripe retries for processing errors
  }

  return NextResponse.json({ received: true })
}
