"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { toast } from "sonner"
import { updateOrganization } from "@/actions/organizations"
import {
  updateOrganizationSchema,
  type UpdateOrganizationInput,
} from "@/lib/validations/organizations"
import type { Organization } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function UpdateOrganizationForm({
  org,
  isOwner,
}: {
  org: Organization
  isOwner: boolean
}) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<UpdateOrganizationInput>({
    resolver: standardSchemaResolver(updateOrganizationSchema),
    defaultValues: {
      name: org.name,
      slug: org.slug,
    },
  })

  function onSubmit(data: UpdateOrganizationInput) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("slug", data.slug)
      const result = await updateOrganization(org.id, formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Organization updated")
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!isOwner} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL slug</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!isOwner} />
                  </FormControl>
                  <FormDescription>
                    Only lowercase letters, numbers, and hyphens.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isOwner && (
              <Button type="submit" className="w-fit" disabled={isPending}>
                {isPending ? "Saving..." : "Save changes"}
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
