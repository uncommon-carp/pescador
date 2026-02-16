import { createServerClient } from "@/lib/supabase/server"

const BUCKET = "guide-photos"

function photoPath(orgId: string, profileId: string) {
  return `${orgId}/${profileId}/photo`
}

export async function uploadGuidePhoto(
  orgId: string,
  profileId: string,
  file: File
) {
  const supabase = await createServerClient()
  const path = photoPath(orgId, profileId)

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true })

  if (error) throw error

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path)

  return `${publicUrl}?t=${Date.now()}`
}

export async function deleteGuidePhoto(orgId: string, profileId: string) {
  const supabase = await createServerClient()
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([photoPath(orgId, profileId)])

  if (error) throw error
}
