"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/contexts/language-context"

const styles: Record<string, string> = {
  // Call statuses
  Answered: "bg-primary/10 text-primary",
  Completed: "bg-emerald-500/10 text-emerald-600",
  Missed: "bg-amber-500/10 text-amber-600",
  Failed: "bg-destructive/10 text-destructive",
}

const labelKeys: Record<string, string> = {
  Answered: "dashboard.statusAnswered",
  Completed: "dashboard.statusCompleted",
  Missed: "dashboard.statusMissed",
  Failed: "dashboard.statusFailed",
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const { t } = useTranslation()
  const label = labelKeys[status] ? t(labelKeys[status]) : status
  return (
    <Badge variant="secondary" className={cn(styles[status] ?? "bg-secondary text-foreground", className)}>
      {label}
    </Badge>
  )
}
