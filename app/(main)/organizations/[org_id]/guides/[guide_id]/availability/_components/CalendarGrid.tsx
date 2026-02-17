"use client"

import { DayCell } from "./DayCell"
import type { AvailabilityTimeSlot, AvailabilityStatus } from "@/types"

type SlotMap = Map<string, Map<AvailabilityTimeSlot, { status: AvailabilityStatus; id: string; booking_id: string | null }>>

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function CalendarGrid({
  year,
  month,
  slotMap,
  onDayClick,
  isNavigating,
}: {
  year: number
  month: number
  slotMap: SlotMap
  onDayClick: (dateStr: string) => void
  isNavigating: boolean
}) {
  const firstDay = new Date(year, month - 1, 1)
  const startDow = firstDay.getDay()
  const daysInMonth = new Date(year, month, 0).getDate()

  const today = new Date()
  const todayStr =
    today.getFullYear() === year && today.getMonth() + 1 === month
      ? today.getDate()
      : -1

  const cells: Array<{ day: number; dateStr: string } | null> = []

  // Empty cells for days before the 1st
  for (let i = 0; i < startDow; i++) {
    cells.push(null)
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    cells.push({ day: d, dateStr })
  }

  return (
    <div
      className={`grid grid-cols-7 gap-px rounded-lg border bg-border ${isNavigating ? "opacity-50" : ""}`}
    >
      {/* Header row */}
      {DAY_LABELS.map((label) => (
        <div
          key={label}
          className="bg-muted text-muted-foreground py-2 text-center text-xs font-medium"
        >
          {label}
        </div>
      ))}

      {/* Day cells */}
      {cells.map((cell, i) =>
        cell ? (
          <DayCell
            key={cell.dateStr}
            day={cell.day}
            dateStr={cell.dateStr}
            isToday={cell.day === todayStr}
            isPast={
              new Date(cell.dateStr + "T00:00:00") <
              new Date(today.toISOString().split("T")[0] + "T00:00:00")
            }
            slots={slotMap.get(cell.dateStr)}
            onClick={() => onDayClick(cell.dateStr)}
          />
        ) : (
          <div key={`empty-${i}`} className="bg-background min-h-[72px]" />
        )
      )}
    </div>
  )
}
