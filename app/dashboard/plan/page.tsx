"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/dashboard/page-header"
import { BillingView } from "@/components/dashboard/billing-view"
import {
  getBillingSummary,
  getPlans,
  type BillingSummary,
  type PlanData,
} from "@/lib/api"
import { useTranslation } from "@/contexts/language-context"
import { Loader2 } from "lucide-react"

export default function BillingPage() {
  const { t } = useTranslation()
  const [summary, setSummary] = useState<BillingSummary | null>(null)
  const [plans, setPlans] = useState<PlanData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getBillingSummary().then(setSummary).catch(() => {}),
      getPlans().then(setPlans).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={t("billing.title")} description={t("billing.description")} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("billing.title")} description={t("billing.description")} />
      <BillingView
        summary={summary}
        plans={plans}
      />
    </div>
  )
}
