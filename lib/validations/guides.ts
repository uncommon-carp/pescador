import { z } from "zod"

// ─── Form schema (client-side validation, no transforms) ─

export const guideFormSchema = z.object({
  user_id: z.string().min(1, "Please select a member"),
  bio: z
    .string()
    .max(2000, "Bio must be 2000 characters or fewer")
    .nullish(),
  specialties: z
    .string()
    .max(500, "Specialties must be 500 characters or fewer")
    .nullish(),
  certifications: z
    .string()
    .max(500, "Certifications must be 500 characters or fewer")
    .nullish(),
})

export type GuideFormInput = z.input<typeof guideFormSchema>

// ─── Server schema (transforms comma strings → arrays) ───

function toArray(val: string | null | undefined): string[] | null {
  if (!val || val.trim() === "") return null
  return val
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

export const createGuideSchema = z.object({
  user_id: z.string().min(1, "Please select a member"),
  bio: z
    .string()
    .max(2000)
    .nullish()
    .transform((val) => val || null),
  specialties: z
    .string()
    .max(500)
    .nullish()
    .transform(toArray),
  certifications: z
    .string()
    .max(500)
    .nullish()
    .transform(toArray),
})

export const updateGuideSchema = z.object({
  bio: z
    .string()
    .max(2000)
    .nullish()
    .transform((val) => val || null),
  specialties: z
    .string()
    .max(500)
    .nullish()
    .transform(toArray),
  certifications: z
    .string()
    .max(500)
    .nullish()
    .transform(toArray),
})
