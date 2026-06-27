"use client"

import { MetricCard } from "@/components/dashboard/metric-card"
import { useTranslation } from "@/contexts/language-context"
import { PhoneCall, Clock, Gauge } from "lucide-react"

export function MetricsGrid({
  callsAnswered,
  avgDuration,
  minutesRemaining,
}: {
  callsAnswered: number
  avgDuration: number
  minutesRemaining: number
}) {
  const { t } = useTranslation()
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MetricCard label={t("dashboard.callsAnswered")} value={callsAnswered} icon={PhoneCall} />
      <MetricCard label={t("dashboard.avgCallDuration")} value={avgDuration} suffix={t("dashboard.secondsSuffix")} icon={Clock} />
      <MetricCard label={t("dashboard.minutesRemaining")} value={minutesRemaining} icon={Gauge} />
    </div>
  )
}
