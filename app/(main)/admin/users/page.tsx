import { getAdminUsers } from "@/actions/admin"
import { PageHeader } from "@/components/shared/PageHeader"
import { SearchInput } from "../_components/SearchInput"
import { Pagination } from "../_components/Pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const PAGE_SIZE = 20

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const { page: pageParam, search } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)

  const { users, total } = await getAdminUsers(page, search ?? "")
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="grid gap-6">
      <PageHeader title="Users" description={`${total} total users`} />

      <SearchInput basePath="/admin/users" />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Sign In</TableHead>
              <TableHead className="text-right">Orgs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground py-8 text-center"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-right">{user.org_count}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination basePath="/admin/users" page={page} totalPages={totalPages} />
    </div>
  )
}
