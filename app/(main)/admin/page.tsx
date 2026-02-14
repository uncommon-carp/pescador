import Link from "next/link"
import { Users, Building2, UserPlus, CreditCard } from "lucide-react"
import { getAdminMetrics } from "@/actions/admin"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function AdminPage() {
  const metrics = await getAdminMetrics()

  const cards = [
    {
      label: "Total Users",
      value: metrics.total_users,
      icon: Users,
    },
    {
      label: "Total Organizations",
      value: metrics.total_organizations,
      icon: Building2,
    },
    {
      label: "Signups (7 days)",
      value: metrics.recent_signups,
      icon: UserPlus,
    },
    {
      label: "Active Subscriptions",
      value: metrics.active_subscriptions,
      icon: CreditCard,
    },
  ]

  return (
    <div className="grid gap-6">
      <PageHeader title="Admin Dashboard" description="System overview">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/users">View Users</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/organizations">View Organizations</Link>
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {card.label}
              </CardTitle>
              <card.icon className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
