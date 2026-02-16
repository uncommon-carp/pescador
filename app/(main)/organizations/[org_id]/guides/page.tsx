import { notFound } from "next/navigation"
import { UserCheck } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { GuidesList } from "./_components/GuidesList"
import { GuideDialog } from "./_components/GuideDialog"
import type { GuideProfile, GuideProfileWithEmail, MemberWithEmail } from "@/types"

export default async function GuidesPage({
  params,
}: {
  params: Promise<{ org_id: string }>
}) {
  const { org_id } = await params
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", org_id)
    .single()

  if (!org) notFound()

  const { data: profiles } = await supabase
    .from("guide_profiles")
    .select("*")
    .eq("organization_id", org_id)
    .order("created_at", { ascending: false })

  const { data: members } = await supabase.rpc("get_org_members_with_email", {
    org_id,
  })

  // Determine current user's role
  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", org_id)
    .eq("user_id", user!.id)
    .single()

  const canManage = member?.role === "owner" || member?.role === "admin"

  const typedProfiles = (profiles ?? []) as GuideProfile[]
  const typedMembers = (members ?? []) as MemberWithEmail[]

  // Join profiles with member emails
  const guidesWithEmail: GuideProfileWithEmail[] = typedProfiles.map((p) => {
    const m = typedMembers.find((m) => m.user_id === p.user_id)
    return { ...p, email: m?.email ?? "Unknown" }
  })

  // Members who don't already have a guide profile
  const profileUserIds = new Set(typedProfiles.map((p) => p.user_id))
  const availableMembers = typedMembers.filter(
    (m) => !profileUserIds.has(m.user_id)
  )

  return (
    <div className="mx-auto grid max-w-4xl gap-8">
      <PageHeader title="Guides" description={org.name}>
        {canManage && availableMembers.length > 0 && (
          <GuideDialog orgId={org_id} availableMembers={availableMembers}>
            <Button>Create Guide Profile</Button>
          </GuideDialog>
        )}
      </PageHeader>

      {guidesWithEmail.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No guide profiles yet"
          description="Create guide profiles for your team members to showcase their expertise."
        >
          {canManage && availableMembers.length > 0 && (
            <GuideDialog orgId={org_id} availableMembers={availableMembers}>
              <Button>Create Guide Profile</Button>
            </GuideDialog>
          )}
        </EmptyState>
      ) : (
        <GuidesList
          guides={guidesWithEmail}
          orgId={org_id}
          canManage={canManage}
          currentUserId={user!.id}
          availableMembers={availableMembers}
        />
      )}
    </div>
  )
}
