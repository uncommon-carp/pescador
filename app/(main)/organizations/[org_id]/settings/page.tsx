import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/PageHeader"
import { UpdateOrganizationForm } from "./_components/UpdateOrganizationForm"
import { DeleteOrganizationSection } from "./_components/DeleteOrganizationSection"

export default async function OrgSettingsPage({
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

  const isOwner = org.owner_id === user!.id

  return (
    <div className="mx-auto grid max-w-2xl gap-8">
      <PageHeader title="Organization settings" description={org.name} />
      <UpdateOrganizationForm org={org} isOwner={isOwner} />
      {isOwner && (
        <DeleteOrganizationSection orgId={org.id} orgName={org.name} />
      )}
    </div>
  )
}
