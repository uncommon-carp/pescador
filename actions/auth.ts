"use server"

import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import {
  loginSchema,
  signupSchema,
  magicLinkSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from "@/lib/validations/auth"
import { sendEmail } from "@/lib/email"
import { WelcomeEmail } from "@/emails/welcome"
import { siteConfig } from "@/config/site"
import { getOrigin } from "@/lib/origin"

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createServerClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: error.message }
  }

  const next = formData.get("next") as string | null
  redirect(next || "/dashboard")
}

export async function signup(formData: FormData) {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const origin = await getOrigin()
  const supabase = await createServerClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  sendEmail({
    to: parsed.data.email,
    subject: `Welcome to ${siteConfig.name}`,
    react: WelcomeEmail({ dashboardUrl: `${origin}/dashboard` }),
  })

  redirect("/verify-email")
}

export async function loginWithMagicLink(formData: FormData) {
  const parsed = magicLinkSchema.safeParse({
    email: formData.get("email"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createServerClient()
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${await getOrigin()}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: "Check your email for a magic link to sign in." }
}

export async function resetPassword(formData: FormData) {
  const parsed = resetPasswordSchema.safeParse({
    email: formData.get("email"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createServerClient()
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${await getOrigin()}/auth/callback?next=/reset-password/update`,
    }
  )

  if (error) {
    return { error: error.message }
  }

  return { success: "Check your email for a password reset link." }
}

export async function updatePassword(formData: FormData) {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createServerClient()
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect("/dashboard")
}

export async function logout() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect("/login")
}
