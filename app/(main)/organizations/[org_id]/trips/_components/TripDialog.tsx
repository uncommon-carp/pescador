"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { createTrip, updateTrip } from "@/actions/trips"
import type { Trip } from "@/types"
import type { TripFormInput } from "@/lib/validations/trips"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TripForm } from "./TripForm"

export function TripDialog({
  orgId,
  trip,
  children,
}: {
  orgId: string
  trip?: Trip
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function onSubmit(data: TripFormInput) {
    startTransition(async () => {
      const result = trip
        ? await updateTrip(orgId, trip.id, data)
        : await createTrip(orgId, data)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(trip ? "Trip updated" : "Trip created")
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{trip ? "Edit Trip" : "Create Trip"}</DialogTitle>
        </DialogHeader>
        <TripForm
          trip={trip}
          isPending={isPending}
          onSubmit={onSubmit}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
