import { redirect } from "next/navigation"
import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { getActiveOrganizationId } from "@/lib/organizations"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user's organizations
  const { data: memberships } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(id, name, slug)")
    .eq("user_id", user!.id)

  // If no organizations, redirect to create one
  if (!memberships || memberships.length === 0) {
    redirect("/organizations/new")
  }

  // Determine active org
  const activeOrgId = await getActiveOrganizationId()
  const orgIds = memberships.map((m) => m.organization_id)
  const validActiveOrgId =
    activeOrgId && orgIds.includes(activeOrgId)
      ? activeOrgId
      : memberships[0].organization_id

  // Get active org details
  const activeMembership = memberships.find(
    (m) => m.organization_id === validActiveOrgId
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeOrg = (activeMembership as any)?.organizations as {
    id: string
    name: string
    slug: string
  } | null

  return (
    <div className="grid gap-6">
      <PageHeader title="Dashboard" description={activeOrg?.name} />
      <Card>
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
          <CardDescription>
            Your organization is set up. Build out your app from here.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/organizations/${validActiveOrgId}/settings`}>
              Organization settings
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/organizations/${validActiveOrgId}/members`}>
              Manage members
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
