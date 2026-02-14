// Re-export generated database types
export type { Database } from "./database.types"

// Shared application types
export type OrgRole = "owner" | "admin" | "member"
export type InvitationRole = "admin" | "member"
export type SubscriptionStatus =
  | "free"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
export type SubscriptionPlan = "free" | "starter" | "pro"
export type ConnectStatus = "not_connected" | "onboarding" | "active"

// Convenience types for UI (derived from database schema)
export type Organization = {
  id: string
  name: string
  slug: string
  owner_id: string
  created_at: string | null
  updated_at: string | null
}

export type OrganizationMember = {
  id: string
  organization_id: string
  user_id: string
  role: string
  created_at: string | null
}

export type MemberWithEmail = {
  id: string
  organization_id: string
  user_id: string
  role: string
  created_at: string
  email: string
}

export type Invitation = {
  id: string
  organization_id: string
  email: string
  role: string
  invited_by: string
  token: string
  expires_at: string
  accepted_at: string | null
  created_at: string | null
}
