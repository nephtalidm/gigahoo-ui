"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/contexts/language-context"
import { Lock } from "lucide-react"

export function UpgradeCard({
  requiredPlan,
  feature,
}: {
  requiredPlan: string
  feature: string
}) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-secondary/30 px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Lock className="h-5 w-5" />
      </span>
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          {t("dashboard.upgradeHeading", { plan: requiredPlan, feature })}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("dashboard.upgradeSubtext", { plan: requiredPlan })}
        </p>
      </div>
      <Button render={<Link href="/dashboard/plan">{t("dashboard.upgradeTo", { plan: requiredPlan })}</Link>} />
    </div>
  )
}
