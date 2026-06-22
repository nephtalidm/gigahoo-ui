import Link from "next/link"
import { PageHeader } from "@/components/dashboard/page-header"
import { MinuteUsageWidget } from "@/components/dashboard/minute-usage-widget"
import { MetricsGrid } from "@/components/dashboard/metrics-grid"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  account,
  calls,
  formatDateTime,
  formatDuration,
  PLAN_MINUTES,
} from "@/lib/data"
import { ArrowRight, ArrowUpRight } from "lucide-react"

export default function OverviewPage() {
  const includedMinutes = PLAN_MINUTES[account.plan]
  const remaining = Math.max(includedMinutes - account.minutesUsed, 0)

  const callsAnswered = calls.filter((c) => c.status === "Completed" || c.status === "Answered").length
  const completedCalls = calls.filter((c) => c.durationSeconds > 0)
  const avgDuration = Math.round(
    completedCalls.reduce((sum, c) => sum + c.durationSeconds, 0) / (completedCalls.length || 1),
  )

  const recentCalls = calls.slice(0, 4)

  const nextPlan = account.plan === "Free" ? "Starter" : account.plan === "Starter" ? "Business" : null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Overview" description={`Welcome back, ${account.businessName}.`} />

      {/* Plan summary */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">{account.plan}</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {includedMinutes.toLocaleString()} min/mo
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {account.minutesUsed.toLocaleString()} of {includedMinutes.toLocaleString()} minutes used this period
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
        minutesUsed={account.minutesUsed}
        includedMinutes={includedMinutes}
        billingPeriod={account.billingPeriod}
      />

      <MetricsGrid
        callsAnswered={callsAnswered}
        avgDuration={avgDuration}
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
          </ul>
        </div>
      </div>
    </div>
  )
}
