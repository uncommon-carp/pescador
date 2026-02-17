import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { AvailabilityCalendar } from "./_components/AvailabilityCalendar"
import type { GuideAvailability } from "@/types"

export default async function AvailabilityPage({
  params,
}: {
  params: Promise<{ org_id: string; guide_id: string }>
}) {
  const { org_id, guide_id } = await params
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch guide profile
  const { data: profile } = await supabase
    .from("guide_profiles")
    .select("*")
    .eq("id", guide_id)
    .eq("organization_id", org_id)
    .single()

  if (!profile) notFound()

  // Get guide's email via org members RPC
  const { data: members } = await supabase.rpc("get_org_members_with_email", {
    org_id,
  })
  const member = (members ?? []).find(
    (m: { user_id: string }) => m.user_id === profile.user_id
  )
  const guideName = member?.email ?? "Guide"

  // Check permissions
  const { data: callerMember } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", org_id)
    .eq("user_id", user!.id)
    .single()

  const canManage =
    callerMember?.role === "owner" ||
    callerMember?.role === "admin" ||
    profile.user_id === user!.id

  if (!canManage) notFound()

  // Fetch current month's availability
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`
  const endDate =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, "0")}-01`

  const { data: availability } = await supabase
    .from("guide_availability")
    .select("*")
    .eq("organization_id", org_id)
    .eq("guide_profile_id", guide_id)
    .gte("date", startDate)
    .lt("date", endDate)
    .order("date")

  return (
    <div className="mx-auto grid max-w-4xl gap-8">
      <PageHeader title={`${guideName} — Availability`}>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/organizations/${org_id}/guides`}>
            <ArrowLeft className="mr-1.5 size-3.5" />
            Guides
          </Link>
        </Button>
      </PageHeader>

      <AvailabilityCalendar
        orgId={org_id}
        guideProfileId={guide_id}
        initialYear={year}
        initialMonth={month}
        initialData={(availability ?? []) as GuideAvailability[]}
      />
    </div>
  )
}
