"use client"

import { useState } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { MissedCallsCalculator } from "@/components/missed-calls-calculator"
import { DemoCallDialog } from "@/components/demo-call-dialog"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/contexts/language-context"
import { businessCategoryKeys } from "@/lib/data"
import {
  CalendarX,
  ClipboardList,
  Clock,
  Languages,
  PhoneCall,
  PhoneMissed,
  PhoneOff,
} from "lucide-react"

/**
 * Industry landing page body (e.g. /industries/plumbing). Fully templated:
 * the localized industry name (categories.*) is interpolated into shared
 * industry strings, and the demo popup opens preselected to this trade.
 */
export function IndustryView({ category }: { category: string }) {
  const { t } = useTranslation()
  const [demoOpen, setDemoOpen] = useState(false)
  const name = t(`categories.${businessCategoryKeys[category] ?? "other"}`)

  const pains = [
    { icon: PhoneOff, text: t("industries.pain1") },
    { icon: PhoneMissed, text: t("industries.pain2") },
    { icon: Languages, text: t("industries.pain3") },
  ]
  const benefits = [
    { icon: Clock, text: t("industries.benefit1") },
    { icon: ClipboardList, text: t("industries.benefit2") },
    { icon: Languages, text: t("industries.benefit3") },
  ]

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                {t("industries.eyebrow", { name })}
              </p>
              <h1 className="mt-4 text-pretty text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {t("industries.heroTitle", { name })}
              </h1>
              <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
                {t("industries.heroSubtitle")}
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button size="lg" className="gap-2 text-base" onClick={() => setDemoOpen(true)}>
                  <PhoneCall className="h-5 w-5" />
                  {t("industries.tryDemo", { name })}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base"
                  render={<Link href="/login">{t("home.heroCtaPrimary")}</Link>}
                />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{t("home.heroNoCard")}</p>
            </div>
          </div>
        </section>

        {/* Pains */}
        <section className="border-b border-border bg-secondary/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t("industries.painsTitle")}
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {pains.map(({ icon: Icon, text }, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t("industries.benefitsTitle", { name })}
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {benefits.map(({ icon: Icon, text }, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <MissedCallsCalculator />

        {/* CTA */}
        <section>
          <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
            <CalendarX className="mx-auto h-8 w-8 text-primary" aria-hidden />
            <h2 className="mt-4 text-pretty text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("industries.ctaTitle", { name })}
            </h2>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" className="text-base" render={<Link href="/login">{t("home.heroCtaPrimary")}</Link>} />
              <Button size="lg" variant="outline" className="gap-2 text-base" onClick={() => setDemoOpen(true)}>
                <PhoneCall className="h-5 w-5" />
                {t("industries.tryDemo", { name })}
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />

      {/* Demo popup preselected to this trade. */}
      <DemoCallDialog open={demoOpen} onOpenChange={setDemoOpen} initialCategory={category} />
    </div>
  )
}
