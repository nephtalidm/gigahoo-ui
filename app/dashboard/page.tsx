"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/dashboard/page-header"
import { MinuteUsageWidget } from "@/components/dashboard/minute-usage-widget"
import { MetricsGrid } from "@/components/dashboard/metrics-grid"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getDashboardOverview, type DashboardOverview } from "@/lib/api"
import { mapApiCall, formatDateTime, formatDuration } from "@/lib/data"
import { ArrowRight, ArrowUpRight, Loader2 } from "lucide-react"

export default function OverviewPage() {
  const [data, setData] = useState<DashboardOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardOverview()
      .then(setData)
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
        <p className="text-muted-foreground">Failed to load dashboard.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    )
  }

  const remaining = data.remainingMinutes
  const recentCalls = data.recentCalls.map(mapApiCall)
  const nextPlan = data.plan === "Free" ? "Starter" : data.plan === "Starter" ? "Business" : null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Overview" description={`Welcome back.`} />

      {/* Plan summary */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">{data.plan}</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {data.includedMinutes.toLocaleString()} min/mo
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.minutesUsed.toLocaleString()} of {data.includedMinutes.toLocaleString()} minutes used this period
            </p>
          </div>
          {nextPlan ? (
            <Button
              className="gap-1.5"
              render={
                <Link href="/dashboard/billing">
                  Upgrade to {nextPlan}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              }
            />
          ) : (
            <Button variant="outline" render={<Link href="/dashboard/billing">Manage plan</Link>} />
          )}
        </div>
      </div>

      <MinuteUsageWidget
        minutesUsed={data.minutesUsed}
        includedMinutes={data.includedMinutes}
        billingPeriod={data.billingPeriod}
      />

      <MetricsGrid
        callsAnswered={data.callsAnswered}
        avgDuration={Math.round(data.avgCallDurationSeconds)}
        minutesRemaining={remaining}
      />

      <div className="grid gap-6">
        {/* Recent calls */}
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold text-foreground">Recent Calls</h2>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              render={
                <Link href="/dashboard/calls">
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            />
          </div>
          <ul className="divide-y divide-border">
            {recentCalls.map((call) => (
              <li key={call.id} className="flex items-start gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{call.callerName}</p>
                    <span className="text-xs text-muted-foreground">·</span>
                    <p className="text-xs text-muted-foreground">{formatDuration(call.durationSeconds)}</p>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{call.summary}</p>
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">{formatDateTime(call.dateTime)}</p>
              </li>
            ))}
            {recentCalls.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                No calls yet. Your AI receptionist is ready to go.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
