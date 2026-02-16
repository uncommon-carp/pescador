"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Pencil, Trash2, Users, Clock } from "lucide-react"
import { toggleTripStatus } from "@/actions/trips"
import type { Trip } from "@/types"
import { formatCurrency, formatDuration } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TripDialog } from "./TripDialog"
import { DeleteTripDialog } from "./DeleteTripDialog"

export function TripCard({
  trip,
  orgId,
  canManage,
}: {
  trip: Trip
  orgId: string
  canManage: boolean
}) {
  const [isPending, startTransition] = useTransition()

  function handleToggleStatus() {
    const newStatus = trip.status === "active" ? "inactive" : "active"
    startTransition(async () => {
      const result = await toggleTripStatus(orgId, trip.id, newStatus)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(`Trip ${newStatus === "active" ? "activated" : "deactivated"}`)
      }
    })
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="grid gap-1">
          <CardTitle className="text-base">{trip.name}</CardTitle>
          {trip.description && (
            <CardDescription className="line-clamp-2">
              {trip.description}
            </CardDescription>
          )}
        </div>
        {canManage ? (
          <button
            onClick={handleToggleStatus}
            disabled={isPending}
            className="cursor-pointer"
          >
            <Badge variant={trip.status === "active" ? "default" : "secondary"}>
              {trip.status}
            </Badge>
          </button>
        ) : (
          <Badge variant={trip.status === "active" ? "default" : "secondary"}>
            {trip.status}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-2xl font-bold">
              {formatCurrency(trip.price_cents)}
            </span>
            {trip.deposit_required && trip.deposit_cents && (
              <span className="text-muted-foreground">
                {formatCurrency(trip.deposit_cents)} deposit
              </span>
            )}
          </div>

          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {formatDuration(trip.duration)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              Up to {trip.capacity}
            </span>
          </div>

          {canManage && (
            <div className="flex gap-2 border-t pt-3">
              <TripDialog orgId={orgId} trip={trip}>
                <Button variant="outline" size="sm" className="flex-1">
                  <Pencil className="mr-1.5 size-3.5" />
                  Edit
                </Button>
              </TripDialog>
              <DeleteTripDialog
                orgId={orgId}
                tripId={trip.id}
                tripName={trip.name}
              >
                <Button variant="outline" size="sm">
                  <Trash2 className="size-3.5" />
                </Button>
              </DeleteTripDialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
