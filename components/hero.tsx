import { Button } from "@/components/ui/button"
import { Check, PhoneCall } from "lucide-react"
import Link from "next/link"

const bullets = [
  "Answers calls 24/7",
  "Supports English, French, Mandarin, Cantonese, Spanish, Japanese, Hindi, Korean, Tagalog, and more",
  "Captures customer information automatically",
  "Built for home-service businesses",
]

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
              AI receptionist for home service businesses
            </span>

            <h1 className="mt-6 text-pretty text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Never Miss Another Customer Call
            </h1>

            <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Gigahoo answers your business calls 24/7, collects customer information, and speaks multiple languages.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="text-base" render={<Link href="/signup">Start Free</Link>} />
              <Button
                size="lg"
                variant="outline"
                className="text-base"
                render={<a href="#pricing">View Pricing</a>}
              />
            </div>

            <p className="mt-3 text-sm">No credit card required</p>

            <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {bullets.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <PhoneCall className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Incoming call</p>
                  <p className="text-xs text-muted-foreground">Answered by Gigahoo · 0:08</p>
                </div>
                <span className="ml-auto flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Live
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm text-foreground">
                  Hi, thanks for calling Summit Plumbing! How can I help you today?
                </div>
                <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                  My water heater is leaking. Can someone come out today?
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm text-foreground">
                  Absolutely. Can I grab your name and address so we can send someone out?
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
                <div>
                  <p className="text-lg font-semibold text-foreground">24/7</p>
                  <p className="text-xs text-muted-foreground">Availability</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">6+</p>
                  <p className="text-xs text-muted-foreground">Languages</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">0</p>
                  <p className="text-xs text-muted-foreground">Missed calls</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
