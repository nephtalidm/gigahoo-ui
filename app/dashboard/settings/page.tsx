"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/dashboard/page-header"
import { SettingsView } from "@/components/dashboard/settings-view"
import { getAccount, getCountries, getRegions, getFeatureSettings, type AccountData, type CountryData, type RegionData, type FeatureSettings } from "@/lib/api"
import { useTranslation } from "@/contexts/language-context"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const { t } = useTranslation()
  const [account, setAccount] = useState<AccountData | null>(null)
  const [countries, setCountries] = useState<CountryData[]>([])
  const [regions, setRegions] = useState<RegionData[]>([])
  const [featureSettings, setFeatureSettings] = useState<FeatureSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getAccount().then(setAccount).catch(() => {}),
      // Address country dropdown is limited to served markets (Country.IsSupported) — the
      // backend does the filtering via supportedOnly.
      getCountries(true).then(setCountries).catch(() => {}),
      getFeatureSettings().then(setFeatureSettings).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (account) {
      getRegions(account.countryId)
        .then(setRegions)
        .catch(() => setRegions([]))
    }
  }, [account?.countryId])

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={t("settings.title")} description={t("settings.description")} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("settings.title")} description={t("settings.description")} />
      {account && (
        <SettingsView
          account={account}
          countries={countries}
          regions={regions}
          featureSettings={featureSettings}
          onCountryChange={(countryId) => {
            getRegions(countryId)
              .then(setRegions)
              .catch(() => setRegions([]))
          }}
        />
      )}
    </div>
  )
}
