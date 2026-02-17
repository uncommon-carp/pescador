"use client"

import { useState, useTransition, useMemo } from "react"
import { toast } from "sonner"
import { bulkSetAvailability } from "@/actions/availability"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { AvailabilityTimeSlot } from "@/types"

const DAYS_OF_WEEK = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
]

const TIME_SLOT_OPTIONS: { value: AvailabilityTimeSlot; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "full_day", label: "Full Day" },
]

export function BulkAvailabilityDialog({
  orgId,
  guideProfileId,
  onSuccess,
  children,
}: {
  orgId: string
  guideProfileId: string
  onSuccess: () => void
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Form state
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [selectedSlots, setSelectedSlots] = useState<AvailabilityTimeSlot[]>([
    "full_day",
  ])
  const [status, setStatus] = useState<"available" | "blocked">("available")

  function toggleDay(day: number) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  function toggleSlot(slot: AvailabilityTimeSlot) {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    )
  }

  // Compute preview count
  const previewCount = useMemo(() => {
    if (!startDate || !endDate || selectedDays.length === 0 || selectedSlots.length === 0)
      return 0
    let count = 0
    const current = new Date(startDate + "T00:00:00")
    const end = new Date(endDate + "T00:00:00")
    while (current <= end) {
      if (selectedDays.includes(current.getDay())) count++
      current.setDate(current.getDate() + 1)
    }
    return count * selectedSlots.length
  }, [startDate, endDate, selectedDays, selectedSlots])

  function handleSubmit() {
    startTransition(async () => {
      const result = await bulkSetAvailability(orgId, guideProfileId, {
        start_date: startDate,
        end_date: endDate,
        days_of_week: selectedDays,
        time_slots: selectedSlots,
        status,
      })
      if (result?.error) {
        toast.error(result.error)
      } else {
        const msg = `Created/updated ${result.count} slot(s)${result.skipped ? `, skipped ${result.skipped} booked` : ""}`
        toast.success(msg)
        onSuccess()
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Set Availability</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="bulk-start">Start date</Label>
              <Input
                id="bulk-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bulk-end">End date</Label>
              <Input
                id="bulk-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Days of week */}
          <div className="grid gap-1.5">
            <Label>Days of week</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <label
                  key={day.value}
                  className="flex items-center gap-1.5 text-sm"
                >
                  <Checkbox
                    checked={selectedDays.includes(day.value)}
                    onCheckedChange={() => toggleDay(day.value)}
                  />
                  {day.label}
                </label>
              ))}
            </div>
          </div>

          {/* Time slots */}
          <div className="grid gap-1.5">
            <Label>Time slots</Label>
            <div className="flex flex-wrap gap-3">
              {TIME_SLOT_OPTIONS.map((slot) => (
                <label
                  key={slot.value}
                  className="flex items-center gap-1.5 text-sm"
                >
                  <Checkbox
                    checked={selectedSlots.includes(slot.value)}
                    onCheckedChange={() => toggleSlot(slot.value)}
                  />
                  {slot.label}
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="grid gap-1.5">
            <Label htmlFor="bulk-status">Status</Label>
            <select
              id="bulk-status"
              className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "available" | "blocked")
              }
            >
              <option value="available">Available</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          {/* Preview */}
          {previewCount > 0 && (
            <p className="text-muted-foreground text-sm">
              This will create/update <strong>{previewCount}</strong> availability
              slot(s).
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isPending || !startDate || !endDate || selectedDays.length === 0 || selectedSlots.length === 0
            }
          >
            {isPending ? "Setting…" : "Set Availability"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
