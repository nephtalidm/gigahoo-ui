"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/contexts/language-context"
import { COMING_SOON_COUNTRY_CODES } from "@/lib/settings"

export function FinalCta() {
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

  return (
    <section id="contact" className="border-b border-border bg-primary">
      <div className="mx-auto max-w-4xl px-4 pt-8 pb-8 text-center sm:px-6 sm:pt-12 sm:pb-12">
        <h2 className="text-pretty text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
          {t("home.ctaTitle")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-primary-foreground/80">
          {t("home.ctaSubtitle")}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {comingSoon ? (
            <Button size="lg" variant="secondary" className="text-base" disabled>
              {t("home.comingSoon")}
            </Button>
          ) : (
            <Button
              size="lg"
              variant="secondary"
              className="text-base"
              render={<a href="#pricing">{t("home.ctaPrimary")}</a>}
            />
          )}
        </div>
      </div>
    </section>
  )
}
