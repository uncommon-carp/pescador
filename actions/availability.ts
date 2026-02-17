"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase/server"
import {
  setDaySlotsSchema,
  bulkAvailabilitySchema,
} from "@/lib/validations/availability"
import type { GuideAvailability } from "@/types"

// ─── Helpers ─────────────────────────────────────────────

async function getCallerRole(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  orgId: string,
  userId: string
) {
  const { data } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", userId)
    .single()
  return data?.role as string | undefined
}

function isAdmin(role: string | undefined) {
  return role === "owner" || role === "admin"
}

async function checkGuideAccess(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  orgId: string,
  guideProfileId: string,
  userId: string
) {
  const role = await getCallerRole(supabase, orgId, userId)
  if (isAdmin(role)) return { allowed: true }

  const { data: profile } = await supabase
    .from("guide_profiles")
    .select("user_id")
    .eq("id", guideProfileId)
    .eq("organization_id", orgId)
    .single()

  if (!profile) return { allowed: false, error: "Guide profile not found" }
  if (profile.user_id !== userId)
    return { allowed: false, error: "You can only manage your own availability" }

  return { allowed: true }
}

// ─── Get Availability for Month ──────────────────────────

export async function getAvailabilityForMonth(
  orgId: string,
  guideProfileId: string,
  year: number,
  month: number
): Promise<{ data?: GuideAvailability[]; error?: string }> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`
  const endDate =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, "0")}-01`

  const { data, error } = await supabase
    .from("guide_availability")
    .select("*")
    .eq("organization_id", orgId)
    .eq("guide_profile_id", guideProfileId)
    .gte("date", startDate)
    .lt("date", endDate)
    .order("date")

  if (error) return { error: "Failed to load availability" }
  return { data: (data ?? []) as GuideAvailability[] }
}

// ─── Set Day Slots ───────────────────────────────────────

export async function setDaySlots(
  orgId: string,
  guideProfileId: string,
  data: Record<string, unknown>
) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const access = await checkGuideAccess(supabase, orgId, guideProfileId, user.id)
  if (!access.allowed) return { error: access.error }

  const parsed = setDaySlotsSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { date, slots } = parsed.data

  // Fetch existing slots for this day to check for booked ones
  const { data: existing } = await supabase
    .from("guide_availability")
    .select("*")
    .eq("guide_profile_id", guideProfileId)
    .eq("organization_id", orgId)
    .eq("date", date)

  const existingMap = new Map(
    (existing ?? []).map((e: GuideAvailability) => [e.time_slot, e])
  )

  // Check if any slot being modified is booked
  for (const slot of slots) {
    const ex = existingMap.get(slot.time_slot)
    if (ex && ex.status === "booked") {
      return { error: `Cannot modify ${slot.time_slot} slot — it's booked` }
    }
  }

  // Handle full_day vs morning/afternoon conflicts
  const hasFullDay = slots.some(
    (s) => s.time_slot === "full_day" && s.status !== null
  )
  const hasHalfDay = slots.some(
    (s) =>
      (s.time_slot === "morning" || s.time_slot === "afternoon") &&
      s.status !== null
  )

  // If setting full_day, remove morning/afternoon (if not booked)
  if (hasFullDay) {
    for (const ts of ["morning", "afternoon"] as const) {
      const ex = existingMap.get(ts)
      if (ex && ex.status !== "booked") {
        await supabase
          .from("guide_availability")
          .delete()
          .eq("id", ex.id)
      }
    }
  }

  // If setting morning/afternoon, remove full_day (if not booked)
  if (hasHalfDay) {
    const ex = existingMap.get("full_day")
    if (ex && ex.status !== "booked") {
      await supabase
        .from("guide_availability")
        .delete()
        .eq("id", ex.id)
    }
  }

  // Process each slot
  for (const slot of slots) {
    const ex = existingMap.get(slot.time_slot)

    if (slot.status === null) {
      // Remove the record
      if (ex && ex.status !== "booked") {
        await supabase
          .from("guide_availability")
          .delete()
          .eq("id", ex.id)
      }
    } else if (ex) {
      // Update existing
      if (ex.status !== "booked") {
        await supabase
          .from("guide_availability")
          .update({ status: slot.status })
          .eq("id", ex.id)
      }
    } else {
      // Insert new
      await supabase.from("guide_availability").insert({
        guide_profile_id: guideProfileId,
        organization_id: orgId,
        date,
        time_slot: slot.time_slot,
        status: slot.status,
      })
    }
  }

  revalidatePath(`/organizations/${orgId}/guides/${guideProfileId}/availability`)
  return { success: true }
}

// ─── Bulk Set Availability ───────────────────────────────

export async function bulkSetAvailability(
  orgId: string,
  guideProfileId: string,
  data: Record<string, unknown>
) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const access = await checkGuideAccess(supabase, orgId, guideProfileId, user.id)
  if (!access.allowed) return { error: access.error }

  const parsed = bulkAvailabilitySchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { start_date, end_date, days_of_week, time_slots, status } = parsed.data

  // Generate dates in range matching days_of_week
  const dates: string[] = []
  const current = new Date(start_date + "T00:00:00")
  const end = new Date(end_date + "T00:00:00")

  while (current <= end) {
    if (days_of_week.includes(current.getDay())) {
      dates.push(current.toISOString().split("T")[0])
    }
    current.setDate(current.getDate() + 1)
  }

  // Cap at 90 days worth of dates
  if (dates.length > 90) {
    return { error: "Bulk set is limited to 90 days" }
  }

  if (dates.length === 0) {
    return { error: "No matching dates in the selected range" }
  }

  // Fetch existing availability for these dates
  const { data: existing } = await supabase
    .from("guide_availability")
    .select("*")
    .eq("guide_profile_id", guideProfileId)
    .eq("organization_id", orgId)
    .in("date", dates)

  const existingSet = new Map<string, GuideAvailability>()
  for (const e of (existing ?? []) as GuideAvailability[]) {
    existingSet.set(`${e.date}:${e.time_slot}`, e)
  }

  let count = 0
  let skipped = 0
  const toInsert: Array<{
    guide_profile_id: string
    organization_id: string
    date: string
    time_slot: string
    status: string
  }> = []

  for (const date of dates) {
    for (const time_slot of time_slots) {
      const key = `${date}:${time_slot}`
      const ex = existingSet.get(key)

      if (ex?.status === "booked") {
        skipped++
        continue
      }

      // Handle full_day vs half-day conflicts for bulk
      if (time_slot === "full_day") {
        // Remove non-booked morning/afternoon
        for (const ts of ["morning", "afternoon"]) {
          const conflict = existingSet.get(`${date}:${ts}`)
          if (conflict && conflict.status !== "booked") {
            await supabase
              .from("guide_availability")
              .delete()
              .eq("id", conflict.id)
          }
        }
      } else {
        // Remove non-booked full_day
        const conflict = existingSet.get(`${date}:full_day`)
        if (conflict && conflict.status !== "booked") {
          await supabase
            .from("guide_availability")
            .delete()
            .eq("id", conflict.id)
        }
      }

      if (ex) {
        // Update existing
        await supabase
          .from("guide_availability")
          .update({ status })
          .eq("id", ex.id)
        count++
      } else {
        toInsert.push({
          guide_profile_id: guideProfileId,
          organization_id: orgId,
          date,
          time_slot,
          status,
        })
      }
    }
  }

  // Batch insert new records
  if (toInsert.length > 0) {
    const { error } = await supabase
      .from("guide_availability")
      .insert(toInsert)
    if (error) return { error: "Failed to create availability records" }
    count += toInsert.length
  }

  revalidatePath(`/organizations/${orgId}/guides/${guideProfileId}/availability`)
  return { success: true, count, skipped }
}
