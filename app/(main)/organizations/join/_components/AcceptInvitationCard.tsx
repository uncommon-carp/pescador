"use client"

import { useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { acceptInvitation } from "@/actions/organizations"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function AcceptInvitationCard() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [isPending, startTransition] = useTransition()

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invalid invitation</CardTitle>
          <CardDescription>No invitation token found.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  function handleAccept() {
    startTransition(async () => {
      const result = await acceptInvitation(token!)
      if (result?.error) {
        toast.error(result.error)
      }
      // On success, the action redirects to /dashboard
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join organization</CardTitle>
        <CardDescription>
          You have been invited to join an organization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleAccept} disabled={isPending} className="w-full">
          {isPending ? "Accepting..." : "Accept invitation"}
        </Button>
      </CardContent>
    </Card>
  )
}
