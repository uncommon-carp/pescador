"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { createGuideProfile, updateGuideProfile } from "@/actions/guides"
import type { GuideProfile, MemberWithEmail } from "@/types"
import type { GuideFormInput } from "@/lib/validations/guides"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { GuideForm } from "./GuideForm"

export function GuideDialog({
  orgId,
  guide,
  availableMembers,
  children,
}: {
  orgId: string
  guide?: GuideProfile & { email?: string }
  availableMembers: MemberWithEmail[]
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function onSubmit(data: GuideFormInput) {
    startTransition(async () => {
      const result = guide
        ? await updateGuideProfile(orgId, guide.id, data)
        : await createGuideProfile(orgId, data)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(guide ? "Guide profile updated" : "Guide profile created")
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {guide ? "Edit Guide Profile" : "Create Guide Profile"}
          </DialogTitle>
        </DialogHeader>
        <GuideForm
          orgId={orgId}
          guide={guide}
          availableMembers={availableMembers}
          isPending={isPending}
          onSubmit={onSubmit}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
