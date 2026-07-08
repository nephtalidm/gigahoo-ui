"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/contexts/language-context"

// Red "Emergency" pill, styled like StatusBadge. Render only when the call is an emergency.
export function EmergencyBadge({ className }: { className?: string }) {
  const { t } = useTranslation()
  return (
    <Badge variant="secondary" className={cn("bg-destructive/10 text-destructive", className)}>
      {t("calls.emergency")}
    </Badge>
  )
}
