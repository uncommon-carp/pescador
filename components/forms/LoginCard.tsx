"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { OAuthButtons } from "@/components/forms/OAuthButtons"
import { LoginForm } from "@/components/forms/LoginForm"
import { MagicLinkForm } from "@/components/forms/MagicLinkForm"

export function LoginCard() {
  const [mode, setMode] = useState<"password" | "magic-link">("password")
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Choose your preferred sign in method</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <OAuthButtons />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card text-muted-foreground px-2">
              Or continue with
            </span>
          </div>
        </div>
        {mode === "password" ? <LoginForm /> : <MagicLinkForm />}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() =>
            setMode(mode === "password" ? "magic-link" : "password")
          }
        >
          {mode === "password"
            ? "Use magic link instead"
            : "Use password instead"}
        </Button>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-muted-foreground text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
