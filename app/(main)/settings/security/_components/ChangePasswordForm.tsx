"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { toast } from "sonner"
import { changePassword } from "@/actions/settings"
import {
  changePasswordSchema,
  type ChangePasswordInput,
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

export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition()

  const form = useForm<ChangePasswordInput>({
    resolver: standardSchemaResolver(changePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  function onSubmit(data: ChangePasswordInput) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append("password", data.password)
      formData.append("confirmPassword", data.confirmPassword)
      const result = await changePassword(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Password changed successfully")
        form.reset()
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-fit" disabled={isPending}>
              {isPending ? "Changing..." : "Change password"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
