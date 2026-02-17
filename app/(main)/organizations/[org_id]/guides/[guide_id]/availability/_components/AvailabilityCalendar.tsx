"use client"

import { useState, useCallback, useTransition } from "react"
import { ChevronLeft, ChevronRight, CalendarPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getAvailabilityForMonth } from "@/actions/availability"
import { CalendarGrid } from "./CalendarGrid"
import { DayDialog } from "./DayDialog"
import { BulkAvailabilityDialog } from "./BulkAvailabilityDialog"
import type { GuideAvailability, AvailabilityTimeSlot, AvailabilityStatus } from "@/types"

type SlotMap = Map<string, Map<AvailabilityTimeSlot, { status: AvailabilityStatus; id: string; booking_id: string | null }>>

function buildSlotMap(data: GuideAvailability[]): SlotMap {
  const map: SlotMap = new Map()
  for (const row of data) {
    if (!map.has(row.date)) map.set(row.date, new Map())
    map.get(row.date)!.set(row.time_slot, {
      status: row.status,
      id: row.id,
      booking_id: row.booking_id,
    })
  }
  return map
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

export function AvailabilityCalendar({
  orgId,
  guideProfileId,
  initialYear,
  initialMonth,
  initialData,
}: {
  orgId: string
  guideProfileId: string
  initialYear: number
  initialMonth: number
  initialData: GuideAvailability[]
}) {
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  const [slotMap, setSlotMap] = useState<SlotMap>(() => buildSlotMap(initialData))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isNavigating, startNavigation] = useTransition()

  const fetchMonth = useCallback(
    (y: number, m: number) => {
      startNavigation(async () => {
        const result = await getAvailabilityForMonth(orgId, guideProfileId, y, m)
        if (result.data) {
          setSlotMap(buildSlotMap(result.data))
        }
      })
    },
    [orgId, guideProfileId]
  )

  function goToPrevMonth() {
    const newMonth = month === 1 ? 12 : month - 1
    const newYear = month === 1 ? year - 1 : year
    setMonth(newMonth)
    setYear(newYear)
    fetchMonth(newYear, newMonth)
  }

  function goToNextMonth() {
    const newMonth = month === 12 ? 1 : month + 1
    const newYear = month === 12 ? year + 1 : year
    setMonth(newMonth)
    setYear(newYear)
    fetchMonth(newYear, newMonth)
  }

  function refreshCurrentMonth() {
    fetchMonth(year, month)
  }

  return (
    <div className="grid gap-4">
      {/* Header with month nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevMonth}
            disabled={isNavigating}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="min-w-[180px] text-center text-lg font-semibold">
            {MONTH_NAMES[month - 1]} {year}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            disabled={isNavigating}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <BulkAvailabilityDialog
          orgId={orgId}
          guideProfileId={guideProfileId}
          onSuccess={refreshCurrentMonth}
        >
          <Button variant="outline" size="sm">
            <CalendarPlus className="mr-1.5 size-3.5" />
            Bulk Set
          </Button>
        </BulkAvailabilityDialog>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-green-500" />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="bg-muted-foreground/40 size-2.5 rounded-full" />
          Blocked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-blue-500" />
          Booked
        </span>
      </div>

      {/* Calendar grid */}
      <CalendarGrid
        year={year}
        month={month}
        slotMap={slotMap}
        onDayClick={setSelectedDate}
        isNavigating={isNavigating}
      />

      {/* Day dialog */}
      {selectedDate && (
        <DayDialog
          orgId={orgId}
          guideProfileId={guideProfileId}
          date={selectedDate}
          daySlots={slotMap.get(selectedDate) ?? new Map()}
          open={!!selectedDate}
          onOpenChange={(open) => {
            if (!open) setSelectedDate(null)
          }}
          onSuccess={refreshCurrentMonth}
        />
      )}
    </div>
  )
}
