"use client"

import { MetricCard } from "@/components/dashboard/metric-card"
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
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      <MetricCard label="Calls Answered" value={callsAnswered} icon={PhoneCall} />
      <MetricCard label="Avg Call Duration" value={avgDuration} suffix="sec" icon={Clock} />
      <MetricCard label="Minutes Remaining" value={minutesRemaining} icon={Gauge} />
    </div>
  )
}
