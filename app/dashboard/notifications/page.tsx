"use client"

import { useEffect, useRef, useState } from "react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  getNotificationSettings,
  updateNotificationSettings,
  type NotificationSettings,
} from "@/lib/api"
import { useTranslation } from "@/contexts/language-context"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { Loader2, CheckCircle2 } from "lucide-react"

export default function NotificationsPage() {
  const { t } = useTranslation()
  const { dirty, setDirty } = useUnsavedChanges()
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  // Snapshot of the last loaded/saved settings; dirty = current differs from this.
  const baselineRef = useRef<string | null>(null)

  useEffect(() => {
    getNotificationSettings()
      .then((s) => {
        setSettings(s)
        baselineRef.current = JSON.stringify(s)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Report dirty state whenever the toggles diverge from the loaded baseline.
  useEffect(() => {
    if (baselineRef.current == null) return
    setDirty(JSON.stringify(settings) !== baselineRef.current)
  }, [settings, setDirty])

  // Clear the guard when leaving the page.
  useEffect(() => () => setDirty(false), [setDirty])

  // Toggles update local state only; persistence happens on Save Changes.
  async function save() {
    if (!settings) return
    setSaving(true)
    try {
      await updateNotificationSettings(settings)
      // The saved values are now the clean baseline → clears the dirty guard.
      baselineRef.current = JSON.stringify(settings)
      setDirty(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // Leave the current values in place so the user can retry.
    } finally {
      setSaving(false)
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
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{t("notifications.summaryLabel")}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t("notifications.summaryHint")}</p>
            </div>
            <div className="flex shrink-0 items-center gap-8">
              <div className="flex flex-col items-center gap-2.5">
                <span className="text-xs font-medium text-muted-foreground">{t("notifications.email")}</span>
                <Switch
                  className="scale-125"
                  checked={settings.emailCallNotifications}
                  onCheckedChange={(v) => setSettings({ ...settings, emailCallNotifications: v })}
                />
              </div>
              <div className="flex flex-col items-center gap-2.5">
                <span className="text-xs font-medium text-muted-foreground">{t("notifications.sms")}</span>
                <Switch
                  className="scale-125"
                  checked={settings.smsCallNotifications}
                  onCheckedChange={(v) => setSettings({ ...settings, smsCallNotifications: v })}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {settings && (
        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              {t("notifications.saved")}
            </span>
          )}
          <Button type="button" onClick={save} disabled={saving || !dirty}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("settings.saveChanges")}
          </Button>
        </div>
      )}
    </div>
  )
}
