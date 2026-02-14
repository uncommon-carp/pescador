import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center">
      <Image
        src="https://images.pexels.com/photos/6739260/pexels-photo-6739260.jpeg?auto=compress&cs=tinysrgb&w=1920"
        alt="Person in waders holding a fly box"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Run your trips,
          <br />
          not your back office
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-white/80">
          Bookings, payments, scheduling, and client management, all in one
          platform built for fishing guides, hunting outfitters, and charter
          captains.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="bg-white text-black hover:bg-white/90">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white/10"
          >
            <a href="#features">Learn More</a>
          </Button>
        </div>
      </div>
    </section>
  )
}
