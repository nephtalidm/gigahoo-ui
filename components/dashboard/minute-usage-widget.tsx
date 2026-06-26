"use client"

import { Button } from "@/components/ui/button"
import { useCountUp } from "@/hooks/use-count-up"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/contexts/language-context"
import Link from "next/link"

type Status = { labelKey: string; className: string }

function getStatus(pct: number): Status {
  if (pct >= 100)
    return { labelKey: "dashboard.statusOverLimit", className: "bg-destructive/10 text-destructive" }
  if (pct >= 85)
    return { labelKey: "dashboard.statusNearLimit", className: "bg-amber-500/10 text-amber-600" }
  return { labelKey: "dashboard.statusHealthy", className: "bg-emerald-500/10 text-emerald-600" }
}

export function MinuteUsageWidget({
  minutesUsed,
  includedMinutes,
  billingPeriod,
}: {
  minutesUsed: number
  includedMinutes: number
  billingPeriod: string
}) {
  const { t } = useTranslation()
  const pct = Math.min((minutesUsed / includedMinutes) * 100, 100)
  const remaining = Math.max(includedMinutes - minutesUsed, 0)
  const status = getStatus(pct)

  const animatedPct = useCountUp(pct)
  const animatedUsed = useCountUp(minutesUsed)
  const animatedRemaining = useCountUp(remaining)

  const size = 200
  const stroke = 16
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dashoffset = circumference - (animatedPct / 100) * circumference

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="relative bg-gradient-to-br from-primary to-primary/80 px-6 py-5 text-primary-foreground sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-primary-foreground/80">{t("dashboard.minuteUsage")}</p>
            <p className="text-xs text-primary-foreground/70">{t("dashboard.billingPeriod", { period: billingPeriod })}</p>
          </div>
          <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold text-primary-foreground">
            {t(status.labelKey)}
          </span>
        </div>
      </div>

      <div className="grid items-center gap-8 px-6 py-8 sm:px-8 md:grid-cols-[auto_1fr]">
        {/* Circular progress ring */}
        <div className="mx-auto flex items-center justify-center">
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                strokeWidth={stroke}
                className="stroke-secondary"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
                className="stroke-primary"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold tracking-tight text-foreground">
                {Math.round(animatedUsed)}
              </span>
              <span className="text-xs font-medium text-muted-foreground">{t("dashboard.minutesUsedLabel")}</span>
              <span className="mt-1 text-xs text-muted-foreground">
                {t("dashboard.ofTotal", { total: includedMinutes.toLocaleString() })}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-4">
            <Stat label={t("dashboard.statUsed")} value={Math.round(animatedUsed).toLocaleString()} />
            <Stat label={t("dashboard.statRemaining")} value={Math.round(animatedRemaining).toLocaleString()} />
            <Stat label={t("dashboard.statUsedPct")} value={`${animatedPct < 0.05 ? "0" : animatedPct.toFixed(1)}%`} />
          </div>

          <div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-300",
                  pct >= 100 ? "bg-destructive" : pct >= 85 ? "bg-amber-500" : "bg-primary",
                )}
                style={{ width: `${animatedPct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("dashboard.includedMinutesRemaining", { remaining: remaining.toLocaleString(), total: includedMinutes.toLocaleString() })}
            </p>
          </div>

          <div>
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/dashboard/billing">{t("dashboard.changePlan")}</Link>}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 px-3 py-3 text-center">
      <p className="text-xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
