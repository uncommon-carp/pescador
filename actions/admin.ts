"use server"

import { requireAdmin } from "@/lib/admin"

export type AdminMetrics = {
  total_users: number
  total_organizations: number
  recent_signups: number
  active_subscriptions: number
}

export type AdminUser = {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  org_count: number
}

export type AdminOrganization = {
  id: string
  name: string
  slug: string
  subscription_status: string | null
  created_at: string
  owner_email: string
  member_count: number
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const { supabase } = await requireAdmin()

  const { data, error } = await supabase.rpc("admin_get_metrics")
  if (error) throw new Error("Failed to load metrics")

  return data as AdminMetrics
}

export async function getAdminUsers(
  page: number = 1,
  search: string = ""
): Promise<{ users: AdminUser[]; total: number }> {
  const { supabase } = await requireAdmin()

  const [usersResult, countResult] = await Promise.all([
    supabase.rpc("admin_list_users", {
      search_query: search,
      page_number: page,
      page_size: 20,
    }),
    supabase.rpc("admin_count_users", {
      search_query: search,
    }),
  ])

  if (usersResult.error) throw new Error("Failed to load users")
  if (countResult.error) throw new Error("Failed to count users")

  return {
    users: (usersResult.data as AdminUser[]) ?? [],
    total: (countResult.data as number) ?? 0,
  }
}

export async function getAdminOrganizations(
  page: number = 1,
  search: string = ""
): Promise<{ organizations: AdminOrganization[]; total: number }> {
  const { supabase } = await requireAdmin()

  const [orgsResult, countResult] = await Promise.all([
    supabase.rpc("admin_list_organizations", {
      search_query: search,
      page_number: page,
      page_size: 20,
    }),
    supabase.rpc("admin_count_organizations", {
      search_query: search,
    }),
  ])

  if (orgsResult.error) throw new Error("Failed to load organizations")
  if (countResult.error) throw new Error("Failed to count organizations")

  return {
    organizations: (orgsResult.data as AdminOrganization[]) ?? [],
    total: (countResult.data as number) ?? 0,
  }
}
