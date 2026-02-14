import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/PageHeader"
import { MembersList } from "./_components/MembersList"
import { InvitationsList } from "./_components/InvitationsList"
import { InviteMemberForm } from "./_components/InviteMemberForm"

export default async function MembersPage({
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

  // Fetch members with emails via RPC
  const { data: members } = await supabase.rpc("get_org_members_with_email", {
    org_id,
  })

  // Fetch pending invitations
  const { data: invitations } = await supabase
    .from("invitations")
    .select("*")
    .eq("organization_id", org_id)
    .is("accepted_at", null)
    .order("created_at", { ascending: false })

  // Determine current user's role
  const currentMember = members?.find(
    (m: { user_id: string }) => m.user_id === user!.id
  )
  const currentRole = currentMember?.role ?? "member"
  const canManage = currentRole === "owner" || currentRole === "admin"
  const isOwner = currentRole === "owner"

  return (
    <div className="mx-auto grid max-w-2xl gap-8">
      <PageHeader title="Members" description={org.name} />
      {canManage && <InviteMemberForm orgId={org_id} />}
      <MembersList
        members={members ?? []}
        orgId={org_id}
        currentUserId={user!.id}
        isOwner={isOwner}
      />
      {canManage && invitations && invitations.length > 0 && (
        <InvitationsList invitations={invitations} orgId={org_id} />
      )}
    </div>
  )
}
