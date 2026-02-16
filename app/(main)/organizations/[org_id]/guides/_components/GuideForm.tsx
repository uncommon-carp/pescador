"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { toast } from "sonner"
import { X } from "lucide-react"
import {
  guideFormSchema,
  type GuideFormInput,
} from "@/lib/validations/guides"
import { uploadGuidePhoto, removeGuidePhoto } from "@/actions/guides"
import type { GuideProfile, MemberWithEmail } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileUpload } from "@/components/shared/FileUpload"

export function GuideForm({
  orgId,
  guide,
  availableMembers,
  isPending,
  onSubmit,
  onCancel,
}: {
  orgId: string
  guide?: GuideProfile & { email?: string }
  availableMembers: MemberWithEmail[]
  isPending: boolean
  onSubmit: (data: GuideFormInput) => void
  onCancel: () => void
}) {
  const [uploading, startUpload] = useTransition()
  const isEdit = !!guide

  const form = useForm<GuideFormInput>({
    resolver: standardSchemaResolver(guideFormSchema),
    defaultValues: {
      user_id: guide?.user_id ?? "",
      bio: guide?.bio ?? "",
      specialties: guide?.specialties?.join(", ") ?? "",
      certifications: guide?.certifications?.join(", ") ?? "",
    },
  })

  function handlePhotoUpload(file: File) {
    if (!guide) return
    startUpload(async () => {
      const formData = new FormData()
      formData.append("file", file)
      const result = await uploadGuidePhoto(orgId, guide.id, formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Photo uploaded")
      }
    })
  }

  function handlePhotoRemove() {
    if (!guide) return
    startUpload(async () => {
      const result = await removeGuidePhoto(orgId, guide.id)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Photo removed")
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        {isEdit && (
          <div className="flex items-center gap-4">
            <FileUpload
              accept="image/jpeg,image/png,image/webp"
              maxSize={5 * 1024 * 1024}
              onUpload={handlePhotoUpload}
              uploading={uploading}
            >
              <Avatar className="size-16">
                <AvatarImage src={guide.photo_url ?? undefined} />
                <AvatarFallback>
                  {(guide.email ?? "G").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </FileUpload>
            {guide.photo_url && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handlePhotoRemove}
                disabled={uploading}
              >
                <X className="mr-1 size-3.5" />
                Remove photo
              </Button>
            )}
          </div>
        )}

        {!isEdit && (
          <FormField
            control={form.control}
            name="user_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Member</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a member..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableMembers.map((m) => (
                      <SelectItem key={m.user_id} value={m.user_id}>
                        {m.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell clients about this guide's experience..."
                  rows={4}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialties"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specialties</FormLabel>
              <FormControl>
                <Input
                  placeholder="Bass, Trout, Fly Fishing"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="certifications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Certifications</FormLabel>
              <FormControl>
                <Input
                  placeholder="USCG Licensed, CPR Certified"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
                ? "Save Changes"
                : "Create Guide Profile"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
