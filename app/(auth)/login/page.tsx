import { Suspense } from "react"
import { LoginCard } from "@/components/forms/LoginCard"

export default function LoginPage() {
  return (
    <Suspense>
      <LoginCard />
    </Suspense>
  )
}
