"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { deleteGuideProfile } from "@/actions/guides"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function DeleteGuideDialog({
  orgId,
  profileId,
  email,
  children,
}: {
  orgId: string
  profileId: string
  email: string
  children: React.ReactNode
}) {
  const [isPending, startTransition] = useTransition()
  const [confirmText, setConfirmText] = useState("")
  const [open, setOpen] = useState(false)

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteGuideProfile(orgId, profileId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Guide profile deleted")
        setOpen(false)
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        setConfirmText("")
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete guide profile?</DialogTitle>
          <DialogDescription>
            This will permanently remove the guide profile for {email}. This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="confirm">
            Type <span className="font-semibold">{email}</span> to confirm
          </Label>
          <Input
            id="confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={email}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={confirmText !== email || isPending}
            onClick={handleDelete}
          >
            {isPending ? "Deleting..." : "Delete permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
