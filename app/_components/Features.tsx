import {
  CalendarDays,
  CreditCard,
  MapPin,
  Users,
  Globe,
  CloudSun,
} from "lucide-react"

const features = [
  {
    icon: CalendarDays,
    title: "Booking Management",
    description:
      "Accept and manage trip bookings with availability calendars, deposits, and automatic confirmations.",
  },
  {
    icon: CreditCard,
    title: "Payment Processing",
    description:
      "Get paid directly through Stripe Connect. Deposits, balances, refunds, and payouts handled for you.",
  },
  {
    icon: MapPin,
    title: "Trip & Scheduling",
    description:
      "Organize your trips by location, species, season, and capacity. Keep your calendar in sync.",
  },
  {
    icon: Users,
    title: "Client Management",
    description:
      "Keep track of your clients, their preferences, trip history, and contact information in one place.",
  },
  {
    icon: Globe,
    title: "Public Booking Page",
    description:
      "A professional booking page you can share with clients. No website builder needed.",
  },
  {
    icon: CloudSun,
    title: "Conditions & Reporting",
    description:
      "Log trip reports, track conditions, and build a record of your seasons over time.",
  },
]

export function Features() {
  return (
    <section id="features" className="scroll-mt-16 bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to run your operation
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Built specifically for guides and outfitters, not retrofitted from
            generic scheduling software.
          </p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-lg border bg-card p-6">
              <feature.icon className="size-6 text-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
