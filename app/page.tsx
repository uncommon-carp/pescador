import { Header } from "./_components/Header"
import { Hero } from "./_components/Hero"
import { Features } from "./_components/Features"
import { About } from "./_components/About"
import { CallToAction } from "./_components/CallToAction"
import { Footer } from "./_components/Footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main>
        <Hero />
        <Features />
        <About />
        <CallToAction />
      </main>
      <Footer />
    </div>
  )
}
