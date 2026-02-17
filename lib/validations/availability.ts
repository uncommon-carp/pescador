import { z } from "zod"

const timeSlotEnum = z.enum(["morning", "afternoon", "full_day"])
const statusEnum = z.enum(["available", "blocked"])

// ─── Set day slots (single day) ──────────────────────────

export const setDaySlotsSchema = z.object({
  date: z.string().date("Invalid date"),
  slots: z.array(
    z.object({
      time_slot: timeSlotEnum,
      status: statusEnum.nullable(),
    })
  ),
})

export type SetDaySlotsInput = z.infer<typeof setDaySlotsSchema>

// ─── Bulk availability (date range) ─────────────────────

export const bulkAvailabilitySchema = z
  .object({
    start_date: z.string().date("Invalid start date"),
    end_date: z.string().date("Invalid end date"),
    days_of_week: z
      .array(z.number().int().min(0).max(6))
      .min(1, "Select at least one day"),
    time_slots: z
      .array(timeSlotEnum)
      .min(1, "Select at least one time slot"),
    status: statusEnum,
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: "End date must be on or after start date",
    path: ["end_date"],
  })

export type BulkAvailabilityInput = z.infer<typeof bulkAvailabilitySchema>
