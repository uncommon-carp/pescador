import { z } from "zod"

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .max(100, "Name must be 100 characters or fewer"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50, "Slug must be 50 characters or fewer")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
})

export const updateOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .max(100, "Name must be 100 characters or fewer"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50, "Slug must be 50 characters or fewer")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
})

export const inviteMemberSchema = z.object({
  email: z.email("Please enter a valid email address"),
  role: z.enum(["admin", "member"], {
    message: "Please select a role",
  }),
})

export const changeMemberRoleSchema = z.object({
  memberId: z.string().uuid("Invalid member ID"),
  role: z.enum(["admin", "member"], {
    message: "Please select a role",
  }),
})

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
export type ChangeMemberRoleInput = z.infer<typeof changeMemberRoleSchema>
