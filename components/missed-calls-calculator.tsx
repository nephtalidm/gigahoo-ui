"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PhoneMissed, TrendingDown } from "lucide-react"
import { useTranslation } from "@/contexts/language-context"

// Share of missed callers assumed to have booked a job — stated in the copy so
// the math is honest, not magic.
const CLOSE_RATE = 0.4
const WEEKS_PER_YEAR = 52

/**
 * "What are missed calls costing you?" — interactive loss estimator.
 * Two sliders (missed calls/week, average job value) drive a big scary yearly
 * number. Pure marketing math, no backend.
 */
export function MissedCallsCalculator() {
  const { t } = useTranslation()
  const [missed, setMissed] = useState(20)
  const [jobValue, setJobValue] = useState(300)

  const lostJobsPerWeek = missed * CLOSE_RATE
  const yearly = Math.round(lostJobsPerWeek * jobValue * WEEKS_PER_YEAR)
  const monthly = Math.round(yearly / 12)
  const money = (n: number) => `$${n.toLocaleString()}`

  return (
    <section className="border-b border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">{t("home.calcEyebrow")}</p>
          <h2 className="mt-3 text-pretty text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("home.calcTitle")}
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">{t("home.calcSubtitle")}</p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:grid-cols-2">
          {/* Inputs */}
          <div className="flex flex-col justify-center gap-8 p-6 sm:p-8">
            <div>
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="calc-missed" className="text-sm font-medium text-foreground">
                  {t("home.calcMissedLabel")}
                </label>
                <span className="rounded-full border border-border bg-secondary px-3 py-1 text-sm font-semibold tabular-nums text-foreground">
                  {missed}
                </span>
              </div>
              <input
                id="calc-missed"
                type="range"
                min={1}
                max={100}
                value={missed}
                onChange={(e) => setMissed(Number(e.target.value))}
                className="mt-3 h-2 w-full cursor-pointer accent-primary"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="calc-value" className="text-sm font-medium text-foreground">
                  {t("home.calcValueLabel")}
                </label>
                <span className="rounded-full border border-border bg-secondary px-3 py-1 text-sm font-semibold tabular-nums text-foreground">
                  {money(jobValue)}
                </span>
              </div>
              <input
                id="calc-value"
                type="range"
                min={50}
                max={2000}
                step={25}
                value={jobValue}
                onChange={(e) => setJobValue(Number(e.target.value))}
                className="mt-3 h-2 w-full cursor-pointer accent-primary"
              />
            </div>

            <p className="text-xs text-muted-foreground">{t("home.calcAssumption")}</p>
          </div>

          {/* Result panel — bold inverse block so the number lands hard. */}
          <div className="flex flex-col justify-center gap-5 bg-foreground p-6 text-background sm:p-8">
            <div className="flex items-center gap-2 text-sm font-medium opacity-70">
              <TrendingDown className="h-4 w-4" />
              <PhoneMissed className="h-4 w-4" />
            </div>
            <div aria-live="polite">
              <p className="text-4xl font-bold tabular-nums tracking-tight sm:text-5xl">{money(yearly)}</p>
              <p className="mt-1 text-sm opacity-70">{t("home.calcYearlyLabel")}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-background/10 p-3">
                <p className="text-xs uppercase tracking-wider opacity-60">{t("home.calcMonthlyLabel")}</p>
                <p className="mt-1 text-lg font-semibold tabular-nums">{money(monthly)}</p>
              </div>
              <div className="rounded-xl bg-background/10 p-3">
                <p className="text-xs uppercase tracking-wider opacity-60">{t("home.calcBookingsLabel")}</p>
                <p className="mt-1 text-lg font-semibold tabular-nums">{Math.round(lostJobsPerWeek)}</p>
              </div>
            </div>
            <Button
              size="lg"
              className="w-full bg-background text-foreground hover:bg-background/90"
              render={<Link href="/login">{t("home.calcCta")}</Link>}
            />
            <p className="text-xs opacity-60">{t("home.calcDisclaimer")}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
