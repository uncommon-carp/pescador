import { z } from "zod"

// ─── Form schema (client-side validation, no transforms) ─

const dollarAmount = z
  .union([z.string(), z.number()])
  .refine(
    (val) => {
      if (val === "" || val === undefined) return false
      const num = typeof val === "number" ? val : parseFloat(val)
      return !isNaN(num) && num >= 0
    },
    "Please enter a valid price"
  )

const optionalDollarAmount = z
  .union([z.string(), z.number(), z.null()])
  .optional()

export const tripFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "Trip name is required")
      .max(100, "Name must be 100 characters or fewer"),
    description: z
      .string()
      .max(1000, "Description must be 1000 characters or fewer")
      .nullish(),
    duration: z.enum(["morning", "afternoon", "full_day"], {
      message: "Please select a duration",
    }),
    price_cents: dollarAmount,
    deposit_required: z.boolean().default(false),
    deposit_cents: optionalDollarAmount,
    capacity: z.coerce
      .number()
      .int("Capacity must be a whole number")
      .min(1, "Capacity must be at least 1")
      .max(100, "Capacity must be 100 or fewer"),
    conditions_notes: z
      .string()
      .max(500, "Notes must be 500 characters or fewer")
      .nullish(),
  })
  .refine(
    (data) => {
      if (!data.deposit_required) return true
      const val = data.deposit_cents
      if (val === undefined || val === null || val === "") return false
      const num = typeof val === "number" ? val : parseFloat(val)
      return !isNaN(num) && num > 0
    },
    { message: "Deposit amount is required when deposit is enabled", path: ["deposit_cents"] }
  )
  .refine(
    (data) => {
      if (!data.deposit_required) return true
      const deposit = data.deposit_cents
      if (deposit === undefined || deposit === null || deposit === "") return true
      const depositNum = typeof deposit === "number" ? deposit : parseFloat(deposit)
      const priceNum = typeof data.price_cents === "number" ? data.price_cents : parseFloat(data.price_cents as string)
      return depositNum <= priceNum
    },
    { message: "Deposit cannot exceed the trip price", path: ["deposit_cents"] }
  )

export type TripFormInput = z.input<typeof tripFormSchema>

// ─── Server schema (transforms dollars → cents) ─────────

function toCents(val: string | number): number {
  const num = typeof val === "number" ? val : parseFloat(val)
  return Math.round(num * 100)
}

export const createTripSchema = z.object({
  name: z
    .string()
    .min(1, "Trip name is required")
    .max(100, "Name must be 100 characters or fewer"),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or fewer")
    .nullish()
    .transform((val) => val || null),
  duration: z.enum(["morning", "afternoon", "full_day"]),
  price_cents: z
    .union([z.string(), z.number()])
    .transform(toCents),
  deposit_required: z.boolean().default(false),
  deposit_cents: z
    .union([z.string(), z.number(), z.null()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === "") return null
      return toCents(val)
    }),
  capacity: z.coerce.number().int().min(1).max(100),
  conditions_notes: z
    .string()
    .max(500, "Notes must be 500 characters or fewer")
    .nullish()
    .transform((val) => val || null),
})

export const updateTripSchema = createTripSchema
