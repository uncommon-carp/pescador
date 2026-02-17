"use client"

import type { AvailabilityTimeSlot, AvailabilityStatus } from "@/types"

type SlotInfo = { status: AvailabilityStatus; id: string; booking_id: string | null }

const SLOT_LABELS: Record<AvailabilityTimeSlot, string> = {
  morning: "AM",
  afternoon: "PM",
  full_day: "All",
}

const STATUS_COLORS: Record<AvailabilityStatus, string> = {
  available: "bg-green-500",
  blocked: "bg-muted-foreground/40",
  booked: "bg-blue-500",
}

export function DayCell({
  day,
  dateStr,
  isToday,
  isPast,
  slots,
  onClick,
}: {
  day: number
  dateStr: string
  isToday: boolean
  isPast: boolean
  slots?: Map<AvailabilityTimeSlot, SlotInfo>
  onClick: () => void
}) {
  const orderedSlots: AvailabilityTimeSlot[] = ["morning", "afternoon", "full_day"]

  return (
    <button
      type="button"
      onClick={onClick}
      className={`bg-background hover:bg-accent flex min-h-[72px] flex-col gap-1 p-1.5 text-left transition-colors ${
        isPast ? "opacity-50" : ""
      }`}
      aria-label={`${dateStr}${slots?.size ? `, ${slots.size} slot(s) set` : ""}`}
    >
      <span
        className={`text-xs font-medium ${
          isToday
            ? "flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
            : "text-foreground"
        }`}
      >
        {day}
      </span>

      {slots && slots.size > 0 && (
        <div className="flex flex-wrap gap-0.5">
          {orderedSlots.map((ts) => {
            const slot = slots.get(ts)
            if (!slot) return null
            return (
              <span
                key={ts}
                className={`inline-flex items-center rounded px-1 py-0.5 text-[10px] font-medium text-white ${STATUS_COLORS[slot.status]}`}
              >
                {SLOT_LABELS[ts]}
              </span>
            )
          })}
        </div>
      )}
    </button>
  )
}
