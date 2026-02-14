import { Suspense } from "react"
import { AcceptInvitationCard } from "./_components/AcceptInvitationCard"

export default function JoinOrganizationPage() {
  return (
    <div className="mx-auto max-w-lg">
      <Suspense>
        <AcceptInvitationCard />
      </Suspense>
    </div>
  )
}
