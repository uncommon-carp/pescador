import { PageHeader } from "@/components/shared/PageHeader"
import { ChangePasswordForm } from "./_components/ChangePasswordForm"
import { DeleteAccountSection } from "./_components/DeleteAccountSection"

export default function SecuritySettingsPage() {
  return (
    <>
      <PageHeader
        title="Security"
        description="Manage your password and account"
      />
      <div className="grid gap-6">
        <ChangePasswordForm />
        <DeleteAccountSection />
      </div>
    </>
  )
}
