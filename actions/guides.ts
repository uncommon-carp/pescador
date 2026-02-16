"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase/server"
import { createGuideSchema, updateGuideSchema } from "@/lib/validations/guides"
import {
  uploadGuidePhoto as uploadPhoto,
  deleteGuidePhoto as deletePhoto,
} from "@/lib/storage/guide-photos"

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

// ─── Create Guide Profile ────────────────────────────────

export async function createGuideProfile(
  orgId: string,
  data: Record<string, unknown>
) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const role = await getCallerRole(supabase, orgId, user.id)
  if (!isAdmin(role)) {
    return { error: "Only owners and admins can create guide profiles" }
  }

  const parsed = createGuideSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase.from("guide_profiles").insert({
    organization_id: orgId,
    user_id: parsed.data.user_id,
    bio: parsed.data.bio,
    specialties: parsed.data.specialties,
    certifications: parsed.data.certifications,
  })

  if (error) {
    if (error.code === "23505") {
      return { error: "This member already has a guide profile" }
    }
    return { error: "Failed to create guide profile" }
  }

  revalidatePath(`/organizations/${orgId}/guides`)
  return { success: true }
}

// ─── Update Guide Profile ────────────────────────────────

export async function updateGuideProfile(
  orgId: string,
  profileId: string,
  data: Record<string, unknown>
) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Check admin or self
  const role = await getCallerRole(supabase, orgId, user.id)
  if (!isAdmin(role)) {
    const { data: profile } = await supabase
      .from("guide_profiles")
      .select("user_id")
      .eq("id", profileId)
      .single()
    if (!profile || profile.user_id !== user.id) {
      return { error: "You can only edit your own profile" }
    }
  }

  const parsed = updateGuideSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase
    .from("guide_profiles")
    .update({
      bio: parsed.data.bio,
      specialties: parsed.data.specialties,
      certifications: parsed.data.certifications,
    })
    .eq("id", profileId)
    .eq("organization_id", orgId)

  if (error) return { error: "Failed to update guide profile" }

  revalidatePath(`/organizations/${orgId}/guides`)
  return { success: true }
}

// ─── Delete Guide Profile ────────────────────────────────

export async function deleteGuideProfile(orgId: string, profileId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const role = await getCallerRole(supabase, orgId, user.id)
  if (!isAdmin(role)) {
    return { error: "Only owners and admins can delete guide profiles" }
  }

  // Delete photo from storage first (ignore errors — may not exist)
  try {
    await deletePhoto(orgId, profileId)
  } catch {
    // Photo may not exist
  }

  const { error } = await supabase
    .from("guide_profiles")
    .delete()
    .eq("id", profileId)
    .eq("organization_id", orgId)

  if (error) return { error: "Failed to delete guide profile" }

  revalidatePath(`/organizations/${orgId}/guides`)
  return { success: true }
}

// ─── Upload Guide Photo ─────────────────────────────────

export async function uploadGuidePhoto(
  orgId: string,
  profileId: string,
  formData: FormData
) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Check admin or self
  const role = await getCallerRole(supabase, orgId, user.id)
  if (!isAdmin(role)) {
    const { data: profile } = await supabase
      .from("guide_profiles")
      .select("user_id")
      .eq("id", profileId)
      .single()
    if (!profile || profile.user_id !== user.id) {
      return { error: "You can only update your own photo" }
    }
  }

  const file = formData.get("file") as File | null
  if (!file) return { error: "No file provided" }

  try {
    const publicUrl = await uploadPhoto(orgId, profileId, file)

    const { error } = await supabase
      .from("guide_profiles")
      .update({ photo_url: publicUrl })
      .eq("id", profileId)
      .eq("organization_id", orgId)

    if (error) return { error: "Failed to save photo URL" }

    revalidatePath(`/organizations/${orgId}/guides`)
    return { success: true, url: publicUrl }
  } catch {
    return { error: "Failed to upload photo" }
  }
}

// ─── Remove Guide Photo ─────────────────────────────────

export async function removeGuidePhoto(orgId: string, profileId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Check admin or self
  const role = await getCallerRole(supabase, orgId, user.id)
  if (!isAdmin(role)) {
    const { data: profile } = await supabase
      .from("guide_profiles")
      .select("user_id")
      .eq("id", profileId)
      .single()
    if (!profile || profile.user_id !== user.id) {
      return { error: "You can only remove your own photo" }
    }
  }

  try {
    await deletePhoto(orgId, profileId)
  } catch {
    // Photo may not exist in storage
  }

  const { error } = await supabase
    .from("guide_profiles")
    .update({ photo_url: null })
    .eq("id", profileId)
    .eq("organization_id", orgId)

  if (error) return { error: "Failed to remove photo" }

  revalidatePath(`/organizations/${orgId}/guides`)
  return { success: true }
}
