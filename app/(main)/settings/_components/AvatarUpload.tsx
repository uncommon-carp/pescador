"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Pencil, Trash2 } from "lucide-react"
import { uploadAvatar, removeAvatar } from "@/actions/settings"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/shared/FileUpload"

const ACCEPT = "image/jpeg,image/png,image/webp"
const MAX_SIZE = 2 * 1024 * 1024 // 2MB

export function AvatarUpload({
  avatarUrl,
  email,
}: {
  avatarUrl: string | null
  email: string
}) {
  const [isPending, startTransition] = useTransition()

  const initials = email.split("@")[0].slice(0, 2).toUpperCase()

  function handleUpload(file: File) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append("file", file)
      const result = await uploadAvatar(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Avatar updated")
      }
    })
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeAvatar()
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Avatar removed")
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avatar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <FileUpload
            accept={ACCEPT}
            maxSize={MAX_SIZE}
            onUpload={handleUpload}
            uploading={isPending}
          >
            <Avatar className="size-20">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="bg-primary text-primary-foreground absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full">
              <Pencil className="size-3" />
            </div>
          </FileUpload>
          <div className="grid gap-1">
            <p className="text-muted-foreground text-sm">
              Click the avatar to upload. JPEG, PNG, or WebP. Max 2MB.
            </p>
            {avatarUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive w-fit"
                onClick={handleRemove}
                disabled={isPending}
              >
                <Trash2 className="size-4" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
