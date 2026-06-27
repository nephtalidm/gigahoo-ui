"use client"

import { useEffect, useRef, useState } from "react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { getAccount, getSettings, updateVoiceSettings, generateVoiceSample } from "@/lib/api"
import { useTranslation } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import { Loader2, CheckCircle2, Play, Pause } from "lucide-react"

// Voices valid on BOTH the live agent (qwen omni-realtime) and the on-demand sample
// TTS (qwen3-tts-flash), so the sample you hear is the exact voice the agent uses.
// `apiName` is what both APIs expect and what's saved to the account; `id` is just the
// per-row key. The FIRST entry is the default when the account hasn't chosen a voice.
const VOICES: { id: string; apiName: string; label: string }[] = [
  { id: "serena", apiName: "Serena", label: "Serena (warm female)" },
  { id: "jennifer", apiName: "Jennifer", label: "Jennifer (American female)" },
  { id: "katerina", apiName: "Katerina", label: "Katerina (female)" },
  { id: "kiki", apiName: "Kiki", label: "Kiki (female)" },
  { id: "sunny", apiName: "Sunny", label: "Sunny (female)" },
  { id: "ethan", apiName: "Ethan", label: "Ethan (warm male)" },
  { id: "ryan", apiName: "Ryan", label: "Ryan (energetic male)" },
  { id: "aiden", apiName: "Aiden", label: "Aiden (American male)" },
  { id: "marcus", apiName: "Marcus", label: "Marcus (male)" },
  { id: "peter", apiName: "Peter", label: "Peter (male)" },
  { id: "dylan", apiName: "Dylan", label: "Dylan (male)" },
  { id: "rocky", apiName: "Rocky", label: "Rocky (male)" },
  { id: "eric", apiName: "Eric", label: "Eric (male)" },
]

const DEFAULT_VOICE = VOICES[0].apiName

export default function VoiceAgentPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [greetingMessage, setGreetingMessage] = useState("")
  const [voice, setVoice] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  // The object URL of the currently-playing sample, so we can revoke it on end/stop.
  const objectUrlRef = useRef<string | null>(null)
  // Monotonic request counter so a newer Play click cancels older in-flight
  // generations — only the most recently requested voice should play.
  const requestRef = useRef(0)

  useEffect(() => {
    Promise.all([getAccount(), getSettings().catch(() => null)])
      .then(([account, settings]) => {
        // Show the account's custom greeting if set; otherwise pre-fill with the
        // site-wide default so an un-customized account has an editable starting
        // point — with the "[Name of business]" placeholder swapped for the
        // account's real business name so the user sees their own name.
        let greeting = account.greetingMessage ?? settings?.defaultGreeting ?? ""
        if (account.greetingMessage == null && account.businessName) {
          greeting = greeting.replaceAll("[Name of business]", account.businessName)
        }
        setGreetingMessage(greeting)
        // Preselect the first voice when the account hasn't chosen one yet.
        setVoice(account.agentVoice ?? DEFAULT_VOICE)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Stop whatever's playing and clean up its audio element + object URL.
  function stopPlayback() {
    requestRef.current++
    audioRef.current?.pause()
    audioRef.current = null
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setPlayingId(null)
  }

  // Synthesize the CURRENT greeting text in the given voice (apiName) on demand,
  // then play it. `id` is the row id, used only for the per-row play/loading state.
  async function playSample(id: string, apiName: string) {
    // Clicking the currently-playing voice pauses/stops it.
    if (playingId === id) {
      stopPlayback()
      return
    }
    // Nothing to synthesize if the greeting is empty.
    const text = greetingMessage.trim()
    if (!text) return

    // Stop any other sample first, then generate this one.
    stopPlayback()
    const reqId = requestRef.current
    setLoadingId(id)
    try {
      const blob = await generateVoiceSample(text, apiName)
      // A newer Play click superseded this request — discard its audio so only
      // the most recently clicked voice ever plays.
      if (reqId !== requestRef.current) return
      const url = URL.createObjectURL(blob)
      objectUrlRef.current = url
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => stopPlayback()
      setPlayingId(id)
      await audio.play().catch(() => stopPlayback())
    } catch {
      if (reqId === requestRef.current) stopPlayback()
    } finally {
      if (reqId === requestRef.current) setLoadingId(null)
    }
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
            const selected = voice === v.apiName
            return (
              <div
                key={v.id}
                role="button"
                tabIndex={0}
                onClick={() => setVoice(v.apiName)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setVoice(v.apiName)
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
                  <span className="truncate text-sm font-medium text-foreground">{v.label}</span>
                </div>
                <button
                  type="button"
                  disabled={loadingId === v.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    playSample(v.id, v.apiName)
                  }}
                  className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
                >
                  {loadingId === v.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : playingId === v.id ? (
                    <Pause className="h-3.5 w-3.5" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  {playingId === v.id ? t("dashboard.pauseSample") : t("dashboard.playSample")}
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
        <Button type="button" onClick={save} disabled={saving} className="h-11">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("settings.saveChanges")}
        </Button>
      </div>
    </div>
  )
}
