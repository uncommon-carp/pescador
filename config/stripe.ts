import type { ConnectStatus, SubscriptionPlan, SubscriptionStatus } from "@/types"

export type PlanKey = Exclude<SubscriptionPlan, "free">

export type PlanConfig = {
  name: string
  priceId: string
  price: number
  features: string[]
}

export const stripePlans: Record<PlanKey, PlanConfig> = {
  starter: {
    name: "Starter",
    priceId: process.env.STRIPE_STARTER_PRICE_ID || "",
    price: 29,
    features: [
      "1 guide",
      "Up to 20 bookings/month",
      "Public booking page",
      "Email notifications",
    ],
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID || "",
    price: 99,
    features: [
      "Unlimited guides",
      "Unlimited bookings",
      "Conditions data",
      "Analytics dashboard",
      "Priority support",
    ],
  },
} as const

export const freePlan = {
  name: "Free",
  price: 0,
  features: ["1 guide", "5 bookings/month", "Public booking page"],
} as const

export const subscriptionStatusConfig: Record<
  SubscriptionStatus,
  {
    label: string
    variant: "default" | "secondary" | "destructive" | "outline"
  }
> = {
  free: { label: "Free", variant: "secondary" },
  trialing: { label: "Trial", variant: "outline" },
  active: { label: "Active", variant: "default" },
  past_due: { label: "Past Due", variant: "destructive" },
  canceled: { label: "Canceled", variant: "secondary" },
  unpaid: { label: "Unpaid", variant: "destructive" },
}

export const connectStatusConfig: Record<
  ConnectStatus,
  {
    label: string
    variant: "default" | "secondary" | "destructive" | "outline"
  }
> = {
  not_connected: { label: "Not Connected", variant: "secondary" },
  onboarding: { label: "Onboarding", variant: "outline" },
  active: { label: "Active", variant: "default" },
}
