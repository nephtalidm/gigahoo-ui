"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/dashboard/page-header"
import { MinuteUsageWidget } from "@/components/dashboard/minute-usage-widget"
import { MetricsGrid } from "@/components/dashboard/metrics-grid"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getDashboardOverview, getAccount, type DashboardOverview } from "@/lib/api"
import { mapApiConversation, formatDateTime, formatDuration } from "@/lib/data"
import { useTranslation } from "@/contexts/language-context"
import { ArrowRight, ArrowUpRight, Loader2 } from "lucide-react"

export default function OverviewPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<DashboardOverview | null>(null)
  const [timeZone, setTimeZone] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Also fetch the account so call times show in the account's region timezone (consistent with
    // the summary email + the calls page), not the viewer's browser / the UTC server.
    Promise.all([getDashboardOverview(), getAccount().catch(() => null)])
      .then(([overview, account]) => {
        setData(overview)
        if (account?.timeZone) setTimeZone(account.timeZone)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-muted-foreground">{t("dashboard.loadFailed")}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          {t("dashboard.tryAgain")}
        </Button>
      </div>
    )
  }

  const remaining = data.remainingMinutes
  const recentCalls = data.recentConversations.map(mapApiConversation)
  const nextPlan = data.plan === "Free" ? "Starter" : data.plan === "Starter" ? "Business" : null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("dashboard.overviewTitle")} description={t("dashboard.overviewWelcome")} />

      {/* Plan summary */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("dashboard.currentPlan")}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">{data.plan}</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {t("dashboard.minutesPerMonth", { minutes: data.includedMinutes.toLocaleString() })}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("dashboard.minutesUsedThisPeriod", { used: data.minutesUsed.toLocaleString(), total: data.includedMinutes.toLocaleString() })}
            </p>
          </div>
          {nextPlan ? (
            <Button
              className="gap-1.5"
              render={
                <Link href="/dashboard/billing">
                  {t("dashboard.upgradeTo", { plan: nextPlan })}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              }
            />
          ) : (
            <Button variant="outline" render={<Link href="/dashboard/billing">{t("dashboard.managePlan")}</Link>} />
          )}
        </div>
      </div>

      <MinuteUsageWidget
        minutesUsed={data.minutesUsed}
        includedMinutes={data.includedMinutes}
        billingPeriod={data.billingPeriod}
      />

      <MetricsGrid
        callsAnswered={data.conversationsAnswered}
        avgDuration={Math.round(data.avgConversationDurationSeconds)}
        minutesRemaining={remaining}
      />

      <div className="grid gap-6">
        {/* Recent calls */}
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold text-foreground">{t("dashboard.recentCalls")}</h2>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              render={
                <Link href="/dashboard/calls">
                  {t("dashboard.viewAll")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            />
          </div>
          <ul className="divide-y divide-border">
            {recentCalls.map((call) => (
              <li key={call.id} className="flex items-start gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="min-w-0 truncate text-sm font-medium text-foreground">{call.callerName}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">·</span>
                    <p className="shrink-0 text-xs text-muted-foreground">{formatDuration(call.durationSeconds)}</p>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{call.summary}</p>
                </div>
                <p className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">{formatDateTime(call.dateTime, timeZone)}</p>
              </li>
            ))}
            {recentCalls.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                {t("dashboard.noCalls")}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
