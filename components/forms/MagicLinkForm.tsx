"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { toast } from "sonner"
import { loginWithMagicLink } from "@/actions/auth"
import { magicLinkSchema, type MagicLinkInput } from "@/lib/validations/auth"
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

export function MagicLinkForm() {
  const [isPending, startTransition] = useTransition()

  const form = useForm<MagicLinkInput>({
    resolver: standardSchemaResolver(magicLinkSchema),
    defaultValues: {
      email: "",
    },
  })

  function onSubmit(data: MagicLinkInput) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append("email", data.email)
      const result = await loginWithMagicLink(formData)
      if (result?.error) {
        toast.error(result.error)
      }
      if (result?.success) {
        toast.success(result.success)
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Sending link..." : "Send magic link"}
        </Button>
      </form>
    </Form>
  )
}
