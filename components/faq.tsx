"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useTranslation } from "@/contexts/language-context"

export function Faq() {
  const { t } = useTranslation()

  const faqs = [
    {
      q: t("home.faqQ1"),
      a: t("home.faqA1"),
    },
    {
      q: t("home.faqQ2"),
      a: t("home.faqA2"),
    },
    {
      q: t("home.faqQ3"),
      a: t("home.faqA3"),
    },
    {
      q: t("home.faqQ4"),
      a: t("home.faqA4"),
    },
  ]

  return (
    <section id="faq" className="border-b border-border">
      <div className="mx-auto max-w-3xl px-4 pt-8 pb-8 sm:px-6 sm:pt-12 sm:pb-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{t("home.faqEyebrow")}</p>
          <h2 className="mt-2 text-pretty text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("home.faqTitle")}
          </h2>
        </div>

        <Accordion className="mt-10 w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium text-foreground">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
