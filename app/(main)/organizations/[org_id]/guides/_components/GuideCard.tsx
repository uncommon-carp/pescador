"use client"

import Link from "next/link"
import { CalendarDays, Pencil, Trash2 } from "lucide-react"
import type { GuideProfileWithEmail, MemberWithEmail } from "@/types"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { GuideDialog } from "./GuideDialog"
import { DeleteGuideDialog } from "./DeleteGuideDialog"

export function GuideCard({
  guide,
  orgId,
  canManage,
  canEdit,
  availableMembers,
}: {
  guide: GuideProfileWithEmail
  orgId: string
  canManage: boolean
  canEdit: boolean
  availableMembers: MemberWithEmail[]
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-start gap-3 space-y-0">
        <Avatar className="size-12">
          <AvatarImage src={guide.photo_url ?? undefined} />
          <AvatarFallback>
            {guide.email.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="grid min-w-0 gap-1">
          <CardTitle className="text-base">{guide.email}</CardTitle>
          {guide.bio && (
            <CardDescription className="line-clamp-2">
              {guide.bio}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {guide.specialties && guide.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {guide.specialties.map((s) => (
                <Badge key={s} variant="secondary">
                  {s}
                </Badge>
              ))}
            </div>
          )}

          {guide.certifications && guide.certifications.length > 0 && (
            <div className="text-muted-foreground flex flex-wrap gap-1 text-xs">
              {guide.certifications.map((c) => (
                <Badge key={c} variant="outline">
                  {c}
                </Badge>
              ))}
            </div>
          )}

          {(canManage || canEdit) && (
            <div className="flex gap-2 border-t pt-3">
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/organizations/${orgId}/guides/${guide.id}/availability`}
                >
                  <CalendarDays className="mr-1.5 size-3.5" />
                  Calendar
                </Link>
              </Button>
              <GuideDialog
                orgId={orgId}
                guide={guide}
                availableMembers={availableMembers}
              >
                <Button variant="outline" size="sm" className="flex-1">
                  <Pencil className="mr-1.5 size-3.5" />
                  Edit
                </Button>
              </GuideDialog>
              {canManage && (
                <DeleteGuideDialog
                  orgId={orgId}
                  profileId={guide.id}
                  email={guide.email}
                >
                  <Button variant="outline" size="sm">
                    <Trash2 className="size-3.5" />
                  </Button>
                </DeleteGuideDialog>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
