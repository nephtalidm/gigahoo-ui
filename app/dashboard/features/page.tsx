"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/dashboard/page-header"
import { OptionalFeatures } from "@/components/dashboard/optional-features"
import { getAccount, getFeatureSettings, type AccountData, type FeatureSettings as FeatureSettingsData } from "@/lib/api"
import type { Plan } from "@/lib/data"
import { useTranslation } from "@/contexts/language-context"
import { Loader2 } from "lucide-react"

export default function FeaturesPage() {
  const { t } = useTranslation()
  const [account, setAccount] = useState<AccountData | null>(null)
  const [settings, setSettings] = useState<FeatureSettingsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getAccount().then(setAccount).catch(() => {}),
      getFeatureSettings().then(setSettings).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={t("features.title")} description={t("features.description")} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("features.title")} description={t("features.description")} />
      <OptionalFeatures
        plan={(account?.plan ?? "Free") as Plan}
        initialSettings={settings}
      />
    </div>
  )
}
