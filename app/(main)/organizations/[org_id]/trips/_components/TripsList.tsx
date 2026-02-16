"use client"

import type { Trip } from "@/types"
import { TripCard } from "./TripCard"

export function TripsList({
  trips,
  orgId,
  canManage,
}: {
  trips: Trip[]
  orgId: string
  canManage: boolean
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {trips.map((trip) => (
        <TripCard
          key={trip.id}
          trip={trip}
          orgId={orgId}
          canManage={canManage}
        />
      ))}
    </div>
  )
}
