import { z } from "zod"

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Name must be 100 characters or fewer"),
})

export const changePasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const changeEmailSchema = z.object({
  email: z.email("Please enter a valid email address"),
})

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required"),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>
