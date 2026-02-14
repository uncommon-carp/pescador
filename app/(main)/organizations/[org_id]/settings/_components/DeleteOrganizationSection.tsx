"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { deleteOrganization } from "@/actions/organizations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function DeleteOrganizationSection({
  orgId,
  orgName,
}: {
  orgId: string
  orgName: string
}) {
  const [isPending, startTransition] = useTransition()
  const [confirmText, setConfirmText] = useState("")
  const [open, setOpen] = useState(false)

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteOrganization(orgId)
      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle>Danger zone</CardTitle>
        <CardDescription>
          Deleting this organization will permanently remove all its data,
          members, and invitations. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete organization</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete {orgName}?</DialogTitle>
              <DialogDescription>
                This action is permanent and cannot be undone. All data,
                members, and invitations will be deleted.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="confirm">
                Type <span className="font-semibold">{orgName}</span> to confirm
              </Label>
              <Input
                id="confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={orgName}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={confirmText !== orgName || isPending}
                onClick={handleDelete}
              >
                {isPending ? "Deleting..." : "Delete permanently"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
