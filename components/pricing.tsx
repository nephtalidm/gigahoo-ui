"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useTranslation } from "@/contexts/language-context"
import { getCurrencyForVisitor } from "@/lib/api"

export function Pricing() {
  const { t } = useTranslation()
  const [currency, setCurrency] = useState<string | null>(null)

  useEffect(() => {
    // Show prices in the visitor's currency, taken from the DB (Country.Currency):
    // middleware records their geo country in a cookie; we resolve the currency
    // via the API. No currency is hardcoded here — until it loads we show the
    // amount without a code.
    const country = (document.cookie.match(/(?:^|;\s*)NEXT_COUNTRY=([^;]+)/)?.[1] ?? "").toUpperCase()
    getCurrencyForVisitor(country)
      .then((c) => setCurrency(c.currency))
      .catch(() => {})
  }, [])

  const plans = [
    {
      slug: "Free",
      name: t("home.pricingFreeName"),
      price: t("home.pricingFreePrice"),
      period: t("home.pricingPeriod"),
      description: t("home.pricingFreeDescription"),
      features: [
        t("home.pricingFreeFeature1"),
        t("home.pricingFreeFeature2"),
        t("home.pricingFreeFeature3"),
        t("home.pricingFreeFeature4"),
        t("home.pricingFreeFeature5"),
      ],
      cta: t("home.pricingFreeCta"),
      featured: false,
    },
    {
      slug: "Starter",
      name: t("home.pricingStarterName"),
      price: t("home.pricingStarterPrice"),
      period: t("home.pricingPeriod"),
      description: t("home.pricingStarterDescription"),
      features: [t("home.pricingStarterFeature1")],
      cta: t("home.pricingStarterCta"),
      featured: true,
    },
    {
      slug: "Business",
      name: t("home.pricingBusinessName"),
      price: t("home.pricingBusinessPrice"),
      period: t("home.pricingPeriod"),
      description: t("home.pricingBusinessDescription"),
      features: [t("home.pricingBusinessFeature1"), t("home.pricingBusinessFeature2")],
      cta: t("home.pricingBusinessCta"),
      featured: false,
    },
  ]

  return (
    <section id="pricing" className="border-b border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-8 sm:px-6 sm:pt-12 sm:pb-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{t("home.pricingEyebrow")}</p>
          <h2 className="mt-2 text-pretty text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("home.pricingTitle")}
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            {t("home.pricingSubtitle")}
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.slug}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-7",
                plan.featured
                  ? "border-primary shadow-md ring-1 ring-primary"
                  : "border-border",
              )}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {t("home.pricingMostPopular")}
                </span>
              )}
              <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-foreground">
                  {plan.price}
                </span>
                {plan.slug !== "Free" && currency && (
                  <span className="text-sm font-medium text-muted-foreground">{currency}</span>
                )}
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
                render={<Link href={`/signup?plan=${plan.slug}`}>{plan.cta}</Link>}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
