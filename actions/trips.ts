"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase/server"
import { createTripSchema, updateTripSchema } from "@/lib/validations/trips"

// ─── Create Trip ─────────────────────────────────────────

export async function createTrip(orgId: string, data: Record<string, unknown>) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Only owners and admins can create trips
  const { data: caller } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single()

  if (!caller || (caller.role !== "owner" && caller.role !== "admin")) {
    return { error: "Only owners and admins can create trips" }
  }

  const parsed = createTripSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase.from("trips").insert({
    organization_id: orgId,
    name: parsed.data.name,
    description: parsed.data.description,
    duration: parsed.data.duration,
    price_cents: parsed.data.price_cents,
    deposit_required: parsed.data.deposit_required,
    deposit_cents: parsed.data.deposit_cents,
    capacity: parsed.data.capacity,
    conditions_notes: parsed.data.conditions_notes,
  })

  if (error) return { error: "Failed to create trip" }

  revalidatePath(`/organizations/${orgId}/trips`)
  return { success: true }
}

// ─── Update Trip ─────────────────────────────────────────

export async function updateTrip(
  orgId: string,
  tripId: string,
  data: Record<string, unknown>
) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: caller } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single()

  if (!caller || (caller.role !== "owner" && caller.role !== "admin")) {
    return { error: "Only owners and admins can update trips" }
  }

  const parsed = updateTripSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase
    .from("trips")
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
      duration: parsed.data.duration,
      price_cents: parsed.data.price_cents,
      deposit_required: parsed.data.deposit_required,
      deposit_cents: parsed.data.deposit_cents,
      capacity: parsed.data.capacity,
      conditions_notes: parsed.data.conditions_notes,
    })
    .eq("id", tripId)
    .eq("organization_id", orgId)

  if (error) return { error: "Failed to update trip" }

  revalidatePath(`/organizations/${orgId}/trips`)
  return { success: true }
}

// ─── Delete Trip ─────────────────────────────────────────

export async function deleteTrip(orgId: string, tripId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: caller } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single()

  if (!caller || (caller.role !== "owner" && caller.role !== "admin")) {
    return { error: "Only owners and admins can delete trips" }
  }

  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", tripId)
    .eq("organization_id", orgId)

  if (error) return { error: "Failed to delete trip" }

  revalidatePath(`/organizations/${orgId}/trips`)
  return { success: true }
}

// ─── Toggle Trip Status ──────────────────────────────────

export async function toggleTripStatus(
  orgId: string,
  tripId: string,
  newStatus: "active" | "inactive"
) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: caller } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single()

  if (!caller || (caller.role !== "owner" && caller.role !== "admin")) {
    return { error: "Only owners and admins can update trips" }
  }

  const { error } = await supabase
    .from("trips")
    .update({ status: newStatus })
    .eq("id", tripId)
    .eq("organization_id", orgId)

  if (error) return { error: "Failed to update trip status" }

  revalidatePath(`/organizations/${orgId}/trips`)
  return { success: true }
}
