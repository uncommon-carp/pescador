import { getAdminOrganizations } from "@/actions/admin"
import { PageHeader } from "@/components/shared/PageHeader"
import { SearchInput } from "../_components/SearchInput"
import { Pagination } from "../_components/Pagination"
import { Badge } from "@/components/ui/badge"
import { subscriptionStatusConfig } from "@/config/stripe"
import type { SubscriptionStatus } from "@/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const PAGE_SIZE = 20

export default async function AdminOrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const { page: pageParam, search } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)

  const { organizations, total } = await getAdminOrganizations(
    page,
    search ?? ""
  )
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Organizations"
        description={`${total} total organizations`}
      />

      <SearchInput basePath="/admin/organizations" />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="text-right">Members</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-8 text-center"
                >
                  No organizations found
                </TableCell>
              </TableRow>
            ) : (
              organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {org.slug}
                  </TableCell>
                  <TableCell>{org.owner_email}</TableCell>
                  <TableCell className="text-right">
                    {org.member_count}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const status = (org.subscription_status || "free") as SubscriptionStatus
                      const config = subscriptionStatusConfig[status]
                      return (
                        <Badge variant={config?.variant ?? "secondary"}>
                          {config?.label ?? status}
                        </Badge>
                      )
                    })()}
                  </TableCell>
                  <TableCell>
                    {new Date(org.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        basePath="/admin/organizations"
        page={page}
        totalPages={totalPages}
      />
    </div>
  )
}
