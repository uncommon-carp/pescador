import {
  LayoutDashboard,
  Users,
  Settings,
  CreditCard,
  Landmark,
  User,
  Shield,
} from "lucide-react"

export type NavItem = {
  label: string
  href: string
  icon: typeof LayoutDashboard
  adminOnly?: boolean
}

export type NavGroup = {
  label: string
  items: NavItem[]
  adminOnly?: boolean
}

export const navigation: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Organization",
    items: [
      {
        label: "Members",
        href: "/organizations/:org_id/members",
        icon: Users,
      },
      {
        label: "Settings",
        href: "/organizations/:org_id/settings",
        icon: Settings,
      },
      {
        label: "Payments",
        href: "/organizations/:org_id/payments",
        icon: Landmark,
      },
    ],
  },
  {
    label: "Billing",
    items: [
      {
        label: "Plans & Billing",
        href: "/organizations/:org_id/billing",
        icon: CreditCard,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        label: "Settings",
        href: "/settings",
        icon: User,
      },
    ],
  },
  {
    label: "Admin",
    adminOnly: true,
    items: [
      {
        label: "Admin Dashboard",
        href: "/admin",
        icon: Shield,
      },
    ],
  },
]

export function resolveHref(href: string, orgId: string | null): string {
  if (!orgId) return href
  return href.replace(":org_id", orgId)
}
