import { createServerClient } from "@/lib/supabase/server"

const AVATARS_BUCKET = "avatars"

function avatarPath(userId: string) {
  return `${userId}/avatar`
}

export async function uploadAvatar(userId: string, file: File) {
  const supabase = await createServerClient()
  const path = avatarPath(userId)

  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(path, file, { upsert: true })

  if (error) throw error

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path)

  // Append timestamp to bust cache after re-upload
  return `${publicUrl}?t=${Date.now()}`
}

export async function deleteAvatar(userId: string) {
  const supabase = await createServerClient()
  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .remove([avatarPath(userId)])

  if (error) throw error
}
