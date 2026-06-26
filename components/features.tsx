"use client"

import {
  Clock,
  Languages,
  FileText,
  ClipboardList,
  MessageCircleQuestion,
} from "lucide-react"
import { useTranslation } from "@/contexts/language-context"

export function Features() {
  const { t } = useTranslation()

  const features = [
    {
      icon: Clock,
      title: t("home.feature1Title"),
      description: t("home.feature1Description"),
    },
    {
      icon: Languages,
      title: t("home.feature2Title"),
      description: t("home.feature2Description"),
    },
    {
      icon: FileText,
      title: t("home.feature3Title"),
      description: t("home.feature3Description"),
    },
    {
      icon: ClipboardList,
      title: t("home.feature4Title"),
      description: t("home.feature4Description"),
    },
    {
      icon: MessageCircleQuestion,
      title: t("home.feature5Title"),
      description: t("home.feature5Description"),
    },
  ]

  return (
    <section id="features" className="border-b border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-8 sm:px-6 sm:pt-12 sm:pb-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{t("home.featuresEyebrow")}</p>
          <h2 className="mt-2 text-pretty text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("home.featuresTitle")}
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            {t("home.featuresSubtitle")}
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-sm"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
