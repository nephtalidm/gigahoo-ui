import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Everything you need to start answering calls.",
    features: [
      "24/7 AI receptionist",
      "Multilingual support",
      "Customer intake",
      "Call summaries",
      "25 included minutes",
    ],
    cta: "Start Free",
    featured: false,
  },
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "Everything in Free, plus:",
    features: ["250 included minutes"],
    cta: "Get Started",
    featured: true,
  },
  {
    name: "Business",
    price: "$99",
    period: "/month",
    description: "Everything in Starter, plus:",
    features: ["Answers questions about services", "1,000 included minutes"],
    cta: "Get Started",
    featured: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="border-b border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Pricing</p>
          <h2 className="mt-2 text-pretty text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple pricing that scales with you
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Start free. Upgrade anytime as your call volume grows.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-7",
                plan.featured
                  ? "border-primary shadow-md ring-1 ring-primary"
                  : "border-border",
              )}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-foreground">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                variant={plan.featured ? "default" : "outline"}
                className="mt-8 w-full"
                render={<Link href={`/signup?plan=${plan.name}`}>{plan.cta}</Link>}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
