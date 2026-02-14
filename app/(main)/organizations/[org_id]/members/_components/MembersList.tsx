"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { removeMember, changeMemberRole } from "@/actions/organizations"
import type { MemberWithEmail } from "@/types"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function MembersList({
  members,
  orgId,
  currentUserId,
  isOwner,
}: {
  members: MemberWithEmail[]
  orgId: string
  currentUserId: string
  isOwner: boolean
}) {
  const [isPending, startTransition] = useTransition()

  function handleRoleChange(memberId: string, role: string) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append("memberId", memberId)
      formData.append("role", role)
      const result = await changeMemberRole(orgId, formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Role updated")
      }
    })
  }

  function handleRemove(memberId: string) {
    startTransition(async () => {
      const result = await removeMember(orgId, memberId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Member removed")
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members ({members.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              {isOwner && <TableHead className="w-[100px]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  {member.email}
                  {member.user_id === currentUserId && (
                    <span className="text-muted-foreground ml-2 text-xs">
                      (you)
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {isOwner && member.role !== "owner" ? (
                    <Select
                      defaultValue={member.role}
                      onValueChange={(value) =>
                        handleRoleChange(member.id, value)
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge
                      variant={
                        member.role === "owner" ? "default" : "secondary"
                      }
                    >
                      {member.role}
                    </Badge>
                  )}
                </TableCell>
                {isOwner && (
                  <TableCell>
                    {member.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleRemove(member.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
