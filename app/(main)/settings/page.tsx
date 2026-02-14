import { createServerClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/PageHeader"
import { AvatarUpload } from "./_components/AvatarUpload"
import { UpdateProfileForm } from "./_components/UpdateProfileForm"
import { ChangeEmailForm } from "./_components/ChangeEmailForm"

export default async function ProfileSettingsPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const fullName = (user?.user_metadata?.full_name as string) ?? ""
  const email = user?.email ?? ""
  const avatarUrl = (user?.user_metadata?.avatar_url as string) ?? null

  return (
    <>
      <PageHeader title="Profile" description="Manage your account settings" />
      <div className="grid gap-6">
        <AvatarUpload avatarUrl={avatarUrl} email={email} />
        <UpdateProfileForm fullName={fullName} />
        <ChangeEmailForm email={email} />
      </div>
    </>
  )
}
