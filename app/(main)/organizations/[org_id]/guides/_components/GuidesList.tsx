"use client"

import type { GuideProfileWithEmail, MemberWithEmail } from "@/types"
import { GuideCard } from "./GuideCard"

export function GuidesList({
  guides,
  orgId,
  canManage,
  currentUserId,
  availableMembers,
}: {
  guides: GuideProfileWithEmail[]
  orgId: string
  canManage: boolean
  currentUserId: string
  availableMembers: MemberWithEmail[]
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {guides.map((guide) => (
        <GuideCard
          key={guide.id}
          guide={guide}
          orgId={orgId}
          canManage={canManage}
          canEdit={canManage || guide.user_id === currentUserId}
          availableMembers={availableMembers}
        />
      ))}
    </div>
  )
}
