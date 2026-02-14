"use client"

import { useTransition } from "react"
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react"
import Link from "next/link"
import { switchOrganization } from "@/actions/organizations"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type OrgItem = {
  id: string
  name: string
  slug: string
  role: string
}

export function OrgSwitcher({
  organizations,
  activeOrgId,
}: {
  organizations: OrgItem[]
  activeOrgId: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const activeOrg = organizations.find((o) => o.id === activeOrgId)

  function handleSwitch(orgId: string) {
    if (orgId === activeOrgId) return
    startTransition(async () => {
      await switchOrganization(orgId)
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-[200px] justify-between"
          disabled={isPending}
        >
          <span className="flex items-center gap-2 truncate">
            <Building2 className="size-4 shrink-0" />
            <span className="truncate">
              {activeOrg?.name ?? "Select organization"}
            </span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => (
          <DropdownMenuItem key={org.id} onClick={() => handleSwitch(org.id)}>
            <span className="truncate">{org.name}</span>
            {org.id === activeOrgId && <Check className="ml-auto size-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/organizations/new">
            <Plus className="size-4" />
            Create organization
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
