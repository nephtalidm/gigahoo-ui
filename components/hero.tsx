"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, PhoneCall } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/contexts/language-context"
import { COMING_SOON_COUNTRY_CODES } from "@/lib/settings"

export function Hero() {
  const { t } = useTranslation()
  // The visitor's country, read from the same cookie middleware sets for geo.
  const [country, setCountry] = useState<string>("")

  useEffect(() => {
    const country = (document.cookie.match(/(?:^|;\s*)NEXT_COUNTRY=([^;]+)/)?.[1] ?? "").toUpperCase()
    setCountry(country)
  }, [])

  // In "coming soon" markets signup isn't open yet, so the primary CTA is
  // disabled and labeled accordingly.
  const comingSoon = COMING_SOON_COUNTRY_CODES.includes(country)

  const bullets = [
    t("home.heroBullet1"),
    t("home.heroBullet2"),
    t("home.heroBullet3"),
    t("home.heroBullet4"),
  ]

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-8 sm:px-6 sm:pt-12 sm:pb-12 lg:pt-14 lg:pb-14">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
              {t("home.heroBadge")}
            </span>

            <h1 className="mt-6 text-pretty text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {t("home.heroTitle")}
            </h1>

            <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              {t("home.heroSubtitle")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {comingSoon ? (
                <Button size="lg" className="text-base" disabled>
                  {t("home.comingSoon")}
                </Button>
              ) : (
                <Button size="lg" className="text-base" render={<Link href="/login">{t("home.heroCtaPrimary")}</Link>} />
              )}
              <Button
                size="lg"
                variant="outline"
                className="text-base"
                render={<a href="#pricing">{t("home.heroCtaSecondary")}</a>}
              />
            </div>

            <p className="mt-3 text-sm">{t("home.heroNoCard")}</p>

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
                  <p className="text-sm font-semibold text-foreground">{t("home.heroCardIncoming")}</p>
                  <p className="text-xs text-muted-foreground">{t("home.heroCardAnswered")}</p>
                </div>
                <span className="ml-auto flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {t("home.heroCardLive")}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm text-foreground">
                  {t("home.heroCardMsg1")}
                </div>
                <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                  {t("home.heroCardMsg2")}
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm text-foreground">
                  {t("home.heroCardMsg3")}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
                <div>
                  <p className="text-lg font-semibold text-foreground">{t("home.heroStat1Value")}</p>
                  <p className="text-xs text-muted-foreground">{t("home.heroStat1Label")}</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{t("home.heroStat2Value")}</p>
                  <p className="text-xs text-muted-foreground">{t("home.heroStat2Label")}</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{t("home.heroStat3Value")}</p>
                  <p className="text-xs text-muted-foreground">{t("home.heroStat3Label")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
