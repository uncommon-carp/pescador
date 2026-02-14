import { PageHeader } from "@/components/shared/PageHeader"
import { CreateOrganizationForm } from "./_components/CreateOrganizationForm"

export default function NewOrganizationPage() {
  return (
    <div className="mx-auto grid max-w-lg gap-6">
      <PageHeader
        title="Create an organization"
        description="Organizations let you collaborate with your team."
      />
      <CreateOrganizationForm />
    </div>
  )
}
