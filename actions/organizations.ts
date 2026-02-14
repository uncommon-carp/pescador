"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase/server"
import {
  setActiveOrganizationId,
  clearActiveOrganizationId,
} from "@/lib/organizations"
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  inviteMemberSchema,
  changeMemberRoleSchema,
} from "@/lib/validations/organizations"
import { nanoid } from "nanoid"
import { sendEmail } from "@/lib/email"
import { InvitationEmail } from "@/emails/invitation"
import { getOrigin } from "@/lib/origin"

// ─── Create Organization ─────────────────────────────────

export async function createOrganization(formData: FormData) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const parsed = createOrganizationSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      owner_id: user.id,
    })
    .select()
    .single()

  if (orgError) {
    if (orgError.code === "23505")
      return { error: "This slug is already taken" }
    return { error: "Failed to create organization" }
  }

  // Add creator as owner member
  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: org.id,
      user_id: user.id,
      role: "owner",
    })

  if (memberError) return { error: "Failed to add you as a member" }

  await setActiveOrganizationId(org.id)
  revalidatePath("/dashboard")
  redirect("/dashboard")
}

// ─── Update Organization ─────────────────────────────────

export async function updateOrganization(orgId: string, formData: FormData) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Only the owner can update the organization
  const { data: org } = await supabase
    .from("organizations")
    .select("owner_id")
    .eq("id", orgId)
    .single()

  if (!org || org.owner_id !== user.id) {
    return { error: "Only the organization owner can update it" }
  }

  const parsed = updateOrganizationSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase
    .from("organizations")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
    })
    .eq("id", orgId)

  if (error) {
    if (error.code === "23505") return { error: "This slug is already taken" }
    return { error: "Failed to update organization" }
  }

  revalidatePath(`/organizations/${orgId}/settings`)
  return { success: true }
}

// ─── Delete Organization ─────────────────────────────────

export async function deleteOrganization(orgId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Only the owner can delete the organization
  const { data: org } = await supabase
    .from("organizations")
    .select("owner_id")
    .eq("id", orgId)
    .single()

  if (!org || org.owner_id !== user.id) {
    return { error: "Only the organization owner can delete it" }
  }

  const { error } = await supabase
    .from("organizations")
    .delete()
    .eq("id", orgId)

  if (error) return { error: "Failed to delete organization" }

  await clearActiveOrganizationId()
  revalidatePath("/dashboard")
  redirect("/dashboard")
}

// ─── Switch Active Organization ──────────────────────────

export async function switchOrganization(orgId: string) {
  await setActiveOrganizationId(orgId)
  revalidatePath("/dashboard")
  redirect("/dashboard")
}

// ─── Invite Member ───────────────────────────────────────

export async function inviteMember(orgId: string, formData: FormData) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Only owners and admins can invite members
  const { data: caller } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single()

  if (!caller || (caller.role !== "owner" && caller.role !== "admin")) {
    return { error: "Only owners and admins can invite members" }
  }

  const parsed = inviteMemberSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  // Check for existing pending invitation
  const { data: existingInvitation } = await supabase
    .from("invitations")
    .select("id")
    .eq("organization_id", orgId)
    .eq("email", parsed.data.email)
    .is("accepted_at", null)
    .maybeSingle()

  if (existingInvitation)
    return { error: "An invitation has already been sent to this email" }

  const token = nanoid(32)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const { error } = await supabase.from("invitations").insert({
    organization_id: orgId,
    email: parsed.data.email,
    role: parsed.data.role,
    invited_by: user.id,
    token,
    expires_at: expiresAt.toISOString(),
  })

  if (error) return { error: "Failed to create invitation" }

  const origin = await getOrigin()

  const { data: org } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", orgId)
    .single()

  sendEmail({
    to: parsed.data.email,
    subject: `You've been invited to join ${org?.name ?? "an organization"}`,
    react: InvitationEmail({
      orgName: org?.name ?? "an organization",
      role: parsed.data.role,
      invitedByEmail: user.email!,
      joinUrl: `${origin}/organizations/join?token=${token}`,
    }),
  })

  revalidatePath(`/organizations/${orgId}/members`)
  return { success: true, token }
}

// ─── Accept Invitation ───────────────────────────────────

export async function acceptInvitation(token: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Find the invitation
  const { data: invitation, error: findError } = await supabase
    .from("invitations")
    .select("*")
    .eq("token", token)
    .is("accepted_at", null)
    .single()

  if (findError || !invitation)
    return { error: "Invalid or expired invitation" }

  // Check expiry
  if (new Date(invitation.expires_at) < new Date()) {
    return { error: "This invitation has expired" }
  }

  // Check email matches
  if (invitation.email !== user.email) {
    return { error: "This invitation was sent to a different email address" }
  }

  // Check not already a member
  const { data: existingMember } = await supabase
    .from("organization_members")
    .select("id")
    .eq("organization_id", invitation.organization_id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existingMember) {
    // Mark invitation as accepted anyway
    await supabase
      .from("invitations")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invitation.id)
    return { error: "You are already a member of this organization" }
  }

  // Add as member
  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: invitation.organization_id,
      user_id: user.id,
      role: invitation.role,
    })

  if (memberError) return { error: "Failed to join organization" }

  // Mark invitation as accepted
  await supabase
    .from("invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invitation.id)

  await setActiveOrganizationId(invitation.organization_id)
  revalidatePath("/dashboard")
  redirect("/dashboard")
}

// ─── Revoke Invitation ───────────────────────────────────

export async function revokeInvitation(orgId: string, invitationId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Only owners and admins can revoke invitations
  const { data: caller } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single()

  if (!caller || (caller.role !== "owner" && caller.role !== "admin")) {
    return { error: "Only owners and admins can revoke invitations" }
  }

  const { error } = await supabase
    .from("invitations")
    .delete()
    .eq("id", invitationId)
    .eq("organization_id", orgId)

  if (error) return { error: "Failed to revoke invitation" }

  revalidatePath(`/organizations/${orgId}/members`)
  return { success: true }
}

// ─── Remove Member ───────────────────────────────────────

export async function removeMember(orgId: string, memberId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Only owners and admins can remove members
  const { data: caller } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single()

  if (!caller || (caller.role !== "owner" && caller.role !== "admin")) {
    return { error: "Only owners and admins can remove members" }
  }

  // Prevent removing the owner
  const { data: member } = await supabase
    .from("organization_members")
    .select("role, user_id")
    .eq("id", memberId)
    .single()

  if (!member) return { error: "Member not found" }
  if (member.role === "owner")
    return { error: "Cannot remove the organization owner" }

  const { error } = await supabase
    .from("organization_members")
    .delete()
    .eq("id", memberId)

  if (error) return { error: "Failed to remove member" }

  revalidatePath(`/organizations/${orgId}/members`)
  return { success: true }
}

// ─── Change Member Role ──────────────────────────────────

export async function changeMemberRole(orgId: string, formData: FormData) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Only the owner can change member roles
  const { data: caller } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single()

  if (!caller || caller.role !== "owner") {
    return { error: "Only the organization owner can change roles" }
  }

  const parsed = changeMemberRoleSchema.safeParse({
    memberId: formData.get("memberId"),
    role: formData.get("role"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  // Prevent changing owner role
  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("id", parsed.data.memberId)
    .single()

  if (!member) return { error: "Member not found" }
  if (member.role === "owner")
    return { error: "Cannot change the owner's role" }

  const { error } = await supabase
    .from("organization_members")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.memberId)
    .eq("organization_id", orgId)

  if (error) return { error: "Failed to change role" }

  revalidatePath(`/organizations/${orgId}/members`)
  return { success: true }
}

// ─── Leave Organization ──────────────────────────────────

export async function leaveOrganization(orgId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Check user is not the owner
  const { data: org } = await supabase
    .from("organizations")
    .select("owner_id")
    .eq("id", orgId)
    .single()

  if (!org) return { error: "Organization not found" }
  if (org.owner_id === user.id) {
    return {
      error:
        "Owners cannot leave their organization. Transfer ownership or delete it.",
    }
  }

  const { error } = await supabase
    .from("organization_members")
    .delete()
    .eq("organization_id", orgId)
    .eq("user_id", user.id)

  if (error) return { error: "Failed to leave organization" }

  await clearActiveOrganizationId()
  revalidatePath("/dashboard")
  redirect("/dashboard")
}
