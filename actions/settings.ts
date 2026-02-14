"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase/server"
import {
  updateProfileSchema,
  changePasswordSchema,
  changeEmailSchema,
  deleteAccountSchema,
} from "@/lib/validations/settings"
import { createAdminClient } from "@/lib/supabase/admin"
import { clearActiveOrganizationId } from "@/lib/organizations"
import {
  uploadAvatar as uploadAvatarFile,
  deleteAvatar as deleteAvatarFile,
} from "@/lib/storage"

export async function updateProfile(formData: FormData) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const parsed = updateProfileSchema.safeParse({
    fullName: formData.get("fullName"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase.auth.updateUser({
    data: { full_name: parsed.data.fullName },
  })

  if (error) return { error: "Failed to update profile" }

  revalidatePath("/settings")
  return { success: true }
}

export async function changePassword(formData: FormData) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const parsed = changePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) return { error: "Failed to change password" }

  return { success: true }
}

export async function changeEmail(formData: FormData) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const parsed = changeEmailSchema.safeParse({
    email: formData.get("email"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  if (parsed.data.email === user.email) {
    return { error: "New email is the same as your current email" }
  }

  const { error } = await supabase.auth.updateUser({
    email: parsed.data.email,
  })

  if (error) return { error: "Failed to change email" }

  return { success: true }
}

export async function deleteAccount(formData: FormData) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const parsed = deleteAccountSchema.safeParse({
    password: formData.get("password"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  // Verify password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: parsed.data.password,
  })
  if (signInError) return { error: "Incorrect password" }

  // Check for owned organizations
  const { data: ownedOrgs } = await supabase
    .from("organizations")
    .select("name")
    .eq("owner_id", user.id)
  if (ownedOrgs && ownedOrgs.length > 0) {
    const orgNames = ownedOrgs.map((o) => o.name).join(", ")
    return {
      error: `You must transfer or delete these organizations before deleting your account: ${orgNames}`,
    }
  }

  // Delete via admin client
  const admin = createAdminClient()
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
  if (deleteError) return { error: "Failed to delete account" }

  // Clean up
  await clearActiveOrganizationId()
  await supabase.auth.signOut()

  return { success: true, deleted: true }
}

const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_AVATAR_SIZE = 2 * 1024 * 1024 // 2MB

export async function uploadAvatar(formData: FormData) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const file = formData.get("file") as File | null
  if (!file || !(file instanceof File)) return { error: "No file provided" }

  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return { error: "File type not allowed. Use JPEG, PNG, or WebP." }
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return { error: "File too large. Maximum size is 2MB." }
  }

  try {
    const avatarUrl = await uploadAvatarFile(user.id, file)

    const { error } = await supabase.auth.updateUser({
      data: { avatar_url: avatarUrl },
    })
    if (error) return { error: "Failed to update profile" }

    revalidatePath("/settings")
    return { success: true, avatarUrl }
  } catch {
    return { error: "Failed to upload avatar" }
  }
}

export async function removeAvatar() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  try {
    await deleteAvatarFile(user.id)
  } catch {
    // File may not exist — that's fine
  }

  const { error } = await supabase.auth.updateUser({
    data: { avatar_url: null },
  })
  if (error) return { error: "Failed to update profile" }

  revalidatePath("/settings")
  return { success: true }
}
