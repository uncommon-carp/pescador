import { createClient } from "@supabase/supabase-js"

// Admin client bypasses RLS - use only for admin operations
// NEVER expose this client to the browser
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
