"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/dashboard/page-header"
import { SettingsView } from "@/components/dashboard/settings-view"
import { getAccount, getCountries, getRegions, type AccountData, type CountryData, type RegionData } from "@/lib/api"
import { useTranslation } from "@/contexts/language-context"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const { t } = useTranslation()
  const [account, setAccount] = useState<AccountData | null>(null)
  const [countries, setCountries] = useState<CountryData[]>([])
  const [regions, setRegions] = useState<RegionData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getAccount().then(setAccount).catch(() => {}),
      getCountries().then(setCountries).catch(() => {}),
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
