import Image from "next/image"

export function About() {
  return (
    <section className="bg-muted py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
          <Image
            src="https://images.unsplash.com/photo-1532015917327-b9da3e865517?w=1200&q=80"
            alt="Fly fishing in a mountain river"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built for guides
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Whether you run a fly fishing operation, a bass charter, a duck
            hunting outfitter, or an offshore sportfishing boat, Pescador is
            built around the way your business actually works.
          </p>
          <p className="mt-4 text-muted-foreground">
            No more juggling spreadsheets, Venmo requests, and text message
            bookings. Manage your availability, take deposits, and give your
            clients a professional booking experience, so you can spend more
            time doing what you love.
          </p>
        </div>
      </div>
    </section>
  )
}
