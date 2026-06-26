"use client"

import { useEffect, useRef, useState } from "react"
import { PageHeader } from "@/components/dashboard/page-header"
import { getAccount, getSettings, updateVoiceSettings } from "@/lib/api"
import { useTranslation } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import { Loader2, CheckCircle2, Play } from "lucide-react"

const VOICES: { id: string; labelKey: string }[] = [
  { id: "cherry", labelKey: "dashboard.voiceCherry" },
  { id: "ethan", labelKey: "dashboard.voiceEthan" },
  { id: "chelsie", labelKey: "dashboard.voiceChelsie" },
  { id: "serena", labelKey: "dashboard.voiceSerena" },
]

export default function VoiceAgentPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [greetingMessage, setGreetingMessage] = useState("")
  const [voice, setVoice] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    Promise.all([getAccount(), getSettings().catch(() => null)])
      .then(([account, settings]) => {
        // Show the account's custom greeting if set; otherwise pre-fill with the
        // site-wide default so an un-customized account has an editable starting point.
        setGreetingMessage(account.greetingMessage ?? settings?.defaultGreeting ?? "")
        setVoice(account.agentVoice ?? null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function playSample(id: string) {
    audioRef.current?.pause()
    const audio = new Audio(`/voice-samples/${id}.mp3`)
    audioRef.current = audio
    audio.play().catch(() => {})
  }

  async function save() {
    setSaving(true)
    try {
      await updateVoiceSettings({
        greetingMessage: greetingMessage.trim() ? greetingMessage.trim() : null,
        agentVoice: voice,
      })
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
        <PageHeader title={t("dashboard.voiceAgentTitle")} description={t("dashboard.voiceAgentDescription")} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("dashboard.voiceAgentTitle")} description={t("dashboard.voiceAgentDescription")} />

      {/* Greeting */}
      <div className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-3">
          <p className="text-sm font-medium text-foreground">{t("dashboard.greetingLabel")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("dashboard.greetingHint")}</p>
        </div>
        <textarea
          value={greetingMessage}
          onChange={(e) => setGreetingMessage(e.target.value)}
          maxLength={500}
          rows={3}
          className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Agent voice */}
      <div className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-3">
          <p className="text-sm font-medium text-foreground">{t("dashboard.voiceLabel")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("dashboard.voiceHint")}</p>
        </div>
        <div className="flex flex-col gap-2">
          {VOICES.map((v) => {
            const selected = voice === v.id
            return (
              <div
                key={v.id}
                role="button"
                tabIndex={0}
                onClick={() => setVoice(v.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setVoice(v.id)
                  }
                }}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-4 transition-colors",
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-accent",
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                      selected ? "border-primary" : "border-muted-foreground/40",
                    )}
                  >
                    {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </span>
                  <span className="truncate text-sm font-medium text-foreground">{t(v.labelKey)}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    playSample(v.id)
                  }}
                  className="flex shrink-0 items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <Play className="h-3.5 w-3.5" />
                  {t("dashboard.playSample")}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            {t("dashboard.voiceSaved")}
          </span>
        )}
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("dashboard.save")}
        </button>
      </div>
    </div>
  )
}
