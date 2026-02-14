"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { navigation, resolveHref } from "@/config/navigation"
import { siteConfig } from "@/config/site"
import { OrgSwitcher } from "@/components/shared/OrgSwitcher"
import { UserMenu } from "@/components/shared/UserMenu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

type OrgItem = {
  id: string
  name: string
  slug: string
  role: string
}

export function AppSidebar({
  organizations,
  activeOrgId,
  userEmail,
  userAvatarUrl,
  isAdmin,
}: {
  organizations: OrgItem[]
  activeOrgId: string | null
  userEmail: string
  userAvatarUrl?: string | null
  isAdmin: boolean
}) {
  const pathname = usePathname()

  const visibleGroups = navigation.filter(
    (group) => !group.adminOnly || isAdmin
  )

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg text-xs font-bold">
                  {siteConfig.initials}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {siteConfig.name}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {organizations.length > 0 && (
          <OrgSwitcher
            organizations={organizations}
            activeOrgId={activeOrgId}
          />
        )}
      </SidebarHeader>
      <SidebarContent>
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const href = resolveHref(item.href, activeOrgId)
                  const isActive =
                    pathname === href || pathname.startsWith(href + "/")

                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                      >
                        <Link href={href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <UserMenu email={userEmail} avatarUrl={userAvatarUrl} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
