import { cookies } from "next/headers"

const ACTIVE_ORG_COOKIE = "active_org_id"

export async function getActiveOrganizationId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(ACTIVE_ORG_COOKIE)?.value ?? null
}

export async function setActiveOrganizationId(orgId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(ACTIVE_ORG_COOKIE, orgId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })
}

export async function clearActiveOrganizationId(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ACTIVE_ORG_COOKIE)
}
