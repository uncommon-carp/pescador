"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { deleteTrip } from "@/actions/trips"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function DeleteTripDialog({
  orgId,
  tripId,
  tripName,
  children,
}: {
  orgId: string
  tripId: string
  tripName: string
  children: React.ReactNode
}) {
  const [isPending, startTransition] = useTransition()
  const [confirmText, setConfirmText] = useState("")
  const [open, setOpen] = useState(false)

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteTrip(orgId, tripId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Trip deleted")
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); setConfirmText("") }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {tripName}?</DialogTitle>
          <DialogDescription>
            This action is permanent and cannot be undone. Any bookings
            associated with this trip type will need to be reassigned.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="confirm">
            Type <span className="font-semibold">{tripName}</span> to confirm
          </Label>
          <Input
            id="confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={tripName}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={confirmText !== tripName || isPending}
            onClick={handleDelete}
          >
            {isPending ? "Deleting..." : "Delete permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
