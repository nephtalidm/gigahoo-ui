"use client"

import { useCountUp } from "@/hooks/use-count-up"
import type { LucideIcon } from "lucide-react"

export function MetricCard({
  label,
  value,
  suffix,
  icon: Icon,
  animate = true,
}: {
  label: string
  value: number
  suffix?: string
  icon: LucideIcon
  animate?: boolean
}) {
  const animated = useCountUp(value)
  const display = animate ? Math.round(animated) : value

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
        {display.toLocaleString()}
        {suffix && <span className="ml-1 text-base font-medium text-muted-foreground">{suffix}</span>}
      </p>
    </div>
  )
}
