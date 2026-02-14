import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CallToAction() {
  return (
    <section className="relative overflow-hidden bg-foreground py-24 text-background">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to spend more time on the water?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-background/70">
          Set up your guide business on Pescador and start taking bookings in
          minutes.
        </p>
        <div className="mt-10">
          <Button
            asChild
            size="lg"
            className="bg-background text-foreground hover:bg-background/90"
          >
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
