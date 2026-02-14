"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { revokeInvitation } from "@/actions/organizations"
import type { Invitation } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function InvitationsList({
  invitations,
  orgId,
}: {
  invitations: Invitation[]
  orgId: string
}) {
  const [isPending, startTransition] = useTransition()

  function handleRevoke(invitationId: string) {
    startTransition(async () => {
      const result = await revokeInvitation(orgId, invitationId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Invitation revoked")
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending invitations ({invitations.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell>{invitation.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{invitation.role}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(invitation.expires_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleRevoke(invitation.id)}
                  >
                    Revoke
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
