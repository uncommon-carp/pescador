import { notFound } from "next/navigation"
import { MapPin } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { TripsList } from "./_components/TripsList"
import { TripDialog } from "./_components/TripDialog"
import type { Trip } from "@/types"

export default async function TripsPage({
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

  const { data: trips } = await supabase
    .from("trips")
    .select("*")
    .eq("organization_id", org_id)
    .order("created_at", { ascending: false })

  // Determine current user's role
  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", org_id)
    .eq("user_id", user!.id)
    .single()

  const canManage = member?.role === "owner" || member?.role === "admin"

  const typedTrips = (trips ?? []) as Trip[]

  return (
    <div className="mx-auto grid max-w-4xl gap-8">
      <PageHeader title="Trips" description={org.name}>
        {canManage && (
          <TripDialog orgId={org_id}>
            <Button>Create Trip</Button>
          </TripDialog>
        )}
      </PageHeader>

      {typedTrips.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No trips yet"
          description="Create your first trip type to start accepting bookings."
        >
          {canManage && (
            <TripDialog orgId={org_id}>
              <Button>Create Trip</Button>
            </TripDialog>
          )}
        </EmptyState>
      ) : (
        <TripsList trips={typedTrips} orgId={org_id} canManage={canManage} />
      )}
    </div>
  )
}
