"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { toast } from "sonner"
import slugify from "slugify"
import { createOrganization } from "@/actions/organizations"
import {
  createOrganizationSchema,
  type CreateOrganizationInput,
} from "@/lib/validations/organizations"
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
import { Card, CardContent } from "@/components/ui/card"

export function CreateOrganizationForm() {
  const [isPending, startTransition] = useTransition()

  const form = useForm<CreateOrganizationInput>({
    resolver: standardSchemaResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  })

  function onNameChange(value: string) {
    form.setValue("name", value)
    const slug = slugify(value, { lower: true, strict: true })
    form.setValue("slug", slug)
  }

  function onSubmit(data: CreateOrganizationInput) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("slug", data.slug)
      const result = await createOrganization(formData)
      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Acme Inc."
                      {...field}
                      onChange={(e) => onNameChange(e.target.value)}
                    />
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
                    <Input placeholder="acme-inc" {...field} />
                  </FormControl>
                  <FormDescription>
                    Only lowercase letters, numbers, and hyphens.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating..." : "Create organization"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
