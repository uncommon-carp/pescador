import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/server"
import { getActiveOrganizationId } from "@/lib/organizations"
import { isAdmin } from "@/lib/admin"
import { AppSidebar } from "@/components/layouts/AppSidebar"
import { AppHeader } from "@/components/layouts/AppHeader"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let organizations: {
    id: string
    name: string
    slug: string
    role: string
  }[] = []
  let activeOrgId: string | null = null

  if (user) {
    const { data: memberships } = await supabase
      .from("organization_members")
      .select("organization_id, role, organizations(id, name, slug)")
      .eq("user_id", user.id)

    organizations = (memberships ?? []).map((m) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const org = (m as any).organizations as {
        id: string
        name: string
        slug: string
      }
      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        role: m.role,
      }
    })

    activeOrgId = await getActiveOrganizationId()
  }

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar
        organizations={organizations}
        activeOrgId={activeOrgId}
        userEmail={user?.email ?? ""}
        userAvatarUrl={user?.user_metadata?.avatar_url as string | undefined}
        isAdmin={user ? isAdmin(user) : false}
      />
      <SidebarInset>
        <AppHeader />
        <div className="flex-1 p-4 pt-0">
          <div className="py-6">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
