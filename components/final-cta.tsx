"use client"

import { Button } from "@/components/ui/button"
import { useTranslation } from "@/contexts/language-context"

export function FinalCta() {
  const { t } = useTranslation()

  return (
    <section id="contact" className="border-b border-border bg-primary">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <h2 className="text-pretty text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
          {t("home.ctaTitle")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-primary-foreground/80">
          {t("home.ctaSubtitle")}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            variant="secondary"
            className="text-base"
            render={<a href="#pricing">{t("home.ctaPrimary")}</a>}
          />
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground/30 bg-transparent text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            render={<a href="#contact">{t("home.ctaSecondary")}</a>}
          />
        </div>
      </div>
    </section>
  )
}
