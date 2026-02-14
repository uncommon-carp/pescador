import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import type { User } from "@supabase/supabase-js"

export function isAdmin(user: User): boolean {
  return user.app_metadata?.is_admin === true
}

export async function requireAdmin() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdmin(user)) notFound()

  return { user, supabase }
}
