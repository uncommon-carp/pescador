"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { toast } from "sonner"
import { changeEmail } from "@/actions/settings"
import {
  changeEmailSchema,
  type ChangeEmailInput,
} from "@/lib/validations/settings"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ChangeEmailForm({ email }: { email: string }) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<ChangeEmailInput>({
    resolver: standardSchemaResolver(changeEmailSchema),
    defaultValues: {
      email,
    },
  })

  function onSubmit(data: ChangeEmailInput) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append("email", data.email)
      const result = await changeEmail(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(
          "Confirmation emails sent to both your old and new email addresses. Please confirm both to complete the change."
        )
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email address</CardTitle>
      </CardHeader>
      <CardContent>
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
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-fit" disabled={isPending}>
              {isPending ? "Saving..." : "Change email"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
