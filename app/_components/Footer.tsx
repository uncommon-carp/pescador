import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold">
            Pescador
          </Link>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-foreground">
              Sign up
            </Link>
          </nav>
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Pescador
        </p>
      </div>
    </footer>
  )
}
