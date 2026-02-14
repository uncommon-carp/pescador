"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { toast } from "sonner"
import { inviteMember } from "@/actions/organizations"
import {
  inviteMemberSchema,
  type InviteMemberInput,
} from "@/lib/validations/organizations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function InviteMemberForm({ orgId }: { orgId: string }) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<InviteMemberInput>({
    resolver: standardSchemaResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  })

  function onSubmit(data: InviteMemberInput) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append("email", data.email)
      formData.append("role", data.role)
      const result = await inviteMember(orgId, formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Invitation sent")
        form.reset()
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite a member</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex items-end gap-3"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="teammate@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? "Sending..." : "Invite"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
