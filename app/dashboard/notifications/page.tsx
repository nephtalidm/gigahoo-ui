"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Switch } from "@/components/ui/switch"
import {
  getNotificationSettings,
  updateNotificationSettings,
  type NotificationSettings,
} from "@/lib/api"
import { useTranslation } from "@/contexts/language-context"
import { Loader2, CheckCircle2 } from "lucide-react"

export default function NotificationsPage() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getNotificationSettings()
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function update(next: NotificationSettings) {
    setSettings(next)
    try {
      await updateNotificationSettings(next)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // Leave the optimistic toggle in place; the user can retry.
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={t("notifications.title")} description={t("notifications.description")} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("notifications.title")} description={t("notifications.description")} />
      {settings && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex h-5 items-center justify-end">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                {t("notifications.saved")}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between gap-4 rounded-lg border border-border p-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{t("notifications.summaryLabel")}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t("notifications.summaryHint")}</p>
            </div>
            <div className="flex shrink-0 items-center gap-6">
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">{t("notifications.email")}</span>
                <Switch
                  checked={settings.emailCallNotifications}
                  onCheckedChange={(v) => update({ ...settings, emailCallNotifications: v })}
                />
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">{t("notifications.sms")}</span>
                <Switch
                  checked={settings.smsCallNotifications}
                  onCheckedChange={(v) => update({ ...settings, smsCallNotifications: v })}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
