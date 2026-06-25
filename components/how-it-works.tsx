"use client"

import { PhoneForwarded, Bot, ClipboardList } from "lucide-react"
import { useTranslation } from "@/contexts/language-context"

export function HowItWorks() {
  const { t } = useTranslation()

  const steps = [
    {
      icon: PhoneForwarded,
      title: t("home.howStep1Title"),
      description: t("home.howStep1Description"),
    },
    {
      icon: Bot,
      title: t("home.howStep2Title"),
      description: t("home.howStep2Description"),
    },
    {
      icon: ClipboardList,
      title: t("home.howStep3Title"),
      description: t("home.howStep3Description"),
    },
  ]

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{t("home.howEyebrow")}</p>
          <h2 className="mt-2 text-pretty text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("home.howTitle")}
          </h2>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="relative flex flex-col items-start">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-muted-foreground">
                  {t("home.howStepLabel", { number: i + 1 })}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
