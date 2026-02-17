"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { setDaySlots } from "@/actions/availability"
import type { AvailabilityTimeSlot, AvailabilityStatus } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type SlotInfo = { status: AvailabilityStatus; id: string; booking_id: string | null }
type LocalSlotState = "available" | "blocked" | null

const TIME_SLOTS: { key: AvailabilityTimeSlot; label: string }[] = [
  { key: "morning", label: "Morning" },
  { key: "afternoon", label: "Afternoon" },
  { key: "full_day", label: "Full Day" },
]

const STATE_CYCLE: (LocalSlotState)[] = [null, "available", "blocked"]

function nextState(current: LocalSlotState): LocalSlotState {
  const idx = STATE_CYCLE.indexOf(current)
  return STATE_CYCLE[(idx + 1) % STATE_CYCLE.length]
}

function stateLabel(state: LocalSlotState) {
  if (state === null) return "Not set"
  if (state === "available") return "Available"
  return "Blocked"
}

function stateStyle(state: LocalSlotState) {
  if (state === "available") return "border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
  if (state === "blocked") return "border-muted-foreground/40 bg-muted text-muted-foreground"
  return "border-border bg-background text-muted-foreground"
}

export function DayDialog({
  orgId,
  guideProfileId,
  date,
  daySlots,
  open,
  onOpenChange,
  onSuccess,
}: {
  orgId: string
  guideProfileId: string
  date: string
  daySlots: Map<AvailabilityTimeSlot, SlotInfo>
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()

  // Local state for each slot
  const [localSlots, setLocalSlots] = useState<
    Map<AvailabilityTimeSlot, LocalSlotState>
  >(() => {
    const map = new Map<AvailabilityTimeSlot, LocalSlotState>()
    for (const ts of TIME_SLOTS) {
      const existing = daySlots.get(ts.key)
      if (existing && existing.status !== "booked") {
        map.set(ts.key, existing.status)
      } else if (existing?.status === "booked") {
        // Booked slots tracked separately
        map.set(ts.key, null)
      } else {
        map.set(ts.key, null)
      }
    }
    return map
  })

  function toggleSlot(key: AvailabilityTimeSlot) {
    // Don't allow toggling booked slots
    if (daySlots.get(key)?.status === "booked") return

    setLocalSlots((prev) => {
      const next = new Map(prev)
      next.set(key, nextState(prev.get(key) ?? null))
      return next
    })
  }

  function handleSave() {
    const slots: Array<{ time_slot: AvailabilityTimeSlot; status: "available" | "blocked" | null }> = []
    for (const ts of TIME_SLOTS) {
      const isBooked = daySlots.get(ts.key)?.status === "booked"
      if (isBooked) continue
      slots.push({ time_slot: ts.key, status: localSlots.get(ts.key) ?? null })
    }

    startTransition(async () => {
      const result = await setDaySlots(orgId, guideProfileId, { date, slots })
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Availability updated")
        onSuccess()
        onOpenChange(false)
      }
    })
  }

  // Format date for display
  const displayDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{displayDate}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-2">
          {TIME_SLOTS.map((ts) => {
            const isBooked = daySlots.get(ts.key)?.status === "booked"

            if (isBooked) {
              return (
                <div
                  key={ts.key}
                  className="flex items-center justify-between rounded-md border border-blue-500 bg-blue-50 px-3 py-2 dark:bg-blue-950"
                >
                  <span className="text-sm font-medium">{ts.label}</span>
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    Booked
                  </span>
                </div>
              )
            }

            const state = localSlots.get(ts.key) ?? null

            return (
              <button
                key={ts.key}
                type="button"
                onClick={() => toggleSlot(ts.key)}
                className={`flex items-center justify-between rounded-md border px-3 py-2 transition-colors ${stateStyle(state)}`}
              >
                <span className="text-sm font-medium">{ts.label}</span>
                <span className="text-xs font-medium">{stateLabel(state)}</span>
              </button>
            )
          })}
        </div>

        <p className="text-muted-foreground text-xs">
          Click a slot to cycle: Not set → Available → Blocked
        </p>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
