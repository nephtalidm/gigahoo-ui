"use client"

import { useEffect, useRef, useState } from "react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { getAccount, getSettings, updateVoiceSettings, updateQuestions, generateVoiceSample, getVoices, type AgentVoice } from "@/lib/api"
import { useTranslation } from "@/contexts/language-context"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { cn } from "@/lib/utils"
import { Loader2, CheckCircle2, Play, Pause, Minus, Plus } from "lucide-react"

// The max-call-length slider runs 1..MAX minutes; one step past the top means "Unlimited" (no cap).
const MAX_CALL_SLIDER_MAX = 60

export default function VoiceAgentPage() {
  const { t } = useTranslation()
  const { dirty, setDirty } = useUnsavedChanges()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [greetingMessage, setGreetingMessage] = useState("")
  // Per-call hard cap in minutes; null = Unlimited (no cap).
  const [maxCallMinutes, setMaxCallMinutes] = useState<number | null>(null)
  const [voices, setVoices] = useState<AgentVoice[]>([])
  const [voice, setVoice] = useState<string | null>(null)
  // "Questions" — which details the agent collects (all default on).
  const [questions, setQuestions] = useState({ collectName: true, collectPhone: true, collectAddress: true, collectEmergency: true })
  // Snapshot of the last loaded/saved values; dirty = current differs from this.
  const baselineRef = useRef<string>("")
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  // The object URL of the currently-playing sample, so we can revoke it on end/stop.
  const objectUrlRef = useRef<string | null>(null)
  // Monotonic request counter so a newer Play click cancels older in-flight
  // generations — only the most recently requested voice should play.
  const requestRef = useRef(0)

  useEffect(() => {
    Promise.all([getAccount(), getSettings().catch(() => null), getVoices().catch(() => [])])
      .then(([account, settings, fetchedVoices]) => {
        // Show the account's custom greeting if set; otherwise pre-fill with the
        // site-wide default so an un-customized account has an editable starting
        // point — with the "[Name of business]" placeholder swapped for the
        // account's real business name so the user sees their own name.
        let greeting = account.greetingMessage ?? settings?.defaultGreeting ?? ""
        if (account.greetingMessage == null && account.businessName) {
          greeting = greeting.replaceAll("[Name of business]", account.businessName)
        }
        setGreetingMessage(greeting)
        // null = Unlimited (slider sits at the top).
        const initialMax = account.maximumCallMinutes
        setMaxCallMinutes(initialMax)
        // The API returns the list pre-ordered (Jennifer first); render in that order.
        setVoices(fetchedVoices)
        // Preselect the API-marked default voice (Jennifer) when the account hasn't chosen
        // one. Only honor a saved voice if it's a real value that still exists in the list —
        // an empty string or a removed/stale voice must NOT beat the default, or the radio
        // ends up matching nothing and looks unselected.
        const saved = account.agentVoice?.trim()
        const initialVoice =
          (saved && fetchedVoices.some((v) => v.apiName === saved) ? saved : null) ??
          fetchedVoices.find((v) => v.isDefault)?.apiName ??
          fetchedVoices[0]?.apiName ??
          null
        setVoice(initialVoice)
        const initialQuestions = {
          collectName: account.collectName ?? true,
          collectPhone: account.collectPhone ?? true,
          collectAddress: account.collectAddress ?? true,
          collectEmergency: account.collectEmergency ?? true,
        }
        setQuestions(initialQuestions)
        // Capture the loaded values as the clean baseline.
        baselineRef.current = JSON.stringify({ greetingMessage: greeting, maxCallMinutes: initialMax, voice: initialVoice, questions: initialQuestions })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Report dirty state whenever the editable values diverge from the baseline.
  useEffect(() => {
    setDirty(JSON.stringify({ greetingMessage, maxCallMinutes, voice, questions }) !== baselineRef.current)
  }, [greetingMessage, maxCallMinutes, voice, questions, setDirty])

  // Clear the guard when leaving the page.
  useEffect(() => () => setDirty(false), [setDirty])

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
      // null = Unlimited; otherwise clamp to the 1–120 min the API accepts.
      const maximumCallMinutes = maxCallMinutes == null ? null : Math.min(Math.max(maxCallMinutes, 1), 120)
      await updateVoiceSettings({
        greetingMessage: greetingMessage.trim() ? greetingMessage.trim() : null,
        agentVoice: voice,
        maximumCallMinutes,
      })
      await updateQuestions(questions)
      // The saved values are now the clean baseline → clears the dirty guard.
      baselineRef.current = JSON.stringify({ greetingMessage, maxCallMinutes, voice, questions })
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
        <PageHeader title={t("dashboard.voiceAgentTitle")} description={t("dashboard.voiceAgentDescription")} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header + Save. The Save button lives at the top so it stays reachable without
          scrolling past the long agent-voice list below. */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title={t("dashboard.voiceAgentTitle")} description={t("dashboard.voiceAgentDescription")} />
        <div className="flex shrink-0 items-center gap-3 sm:pt-1">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              {t("dashboard.voiceSaved")}
            </span>
          )}
          <Button type="button" onClick={save} disabled={saving || !dirty}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("settings.saveChanges")}
          </Button>
        </div>
      </div>

      {/* Greeting */}
      <div className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-3">
          <p className="text-base font-semibold text-foreground">{t("dashboard.greetingLabel")}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("dashboard.greetingHint")}</p>
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
          <p className="text-base font-semibold text-foreground">{t("dashboard.voiceLabel")}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("dashboard.voiceHint")}</p>
        </div>
        <div className="flex flex-col gap-5">
          {/* Grouped by the language each voice speaks (API pre-orders by language). */}
          {Array.from(new Map(voices.map((g) => [g.language ?? "", true])).keys()).map((lang) => (
          <div key={lang || "other"} className="flex flex-col gap-2">
          {lang && (
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {(() => { const k = `dashboard.voiceLang${lang}`; const tr = t(k); return tr === k ? lang : tr })()}
            </p>
          )}
          {voices.filter((v) => (v.language ?? "") === lang).map((v) => {
            const selected = voice === v.apiName
            return (
              <div
                key={v.apiName}
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
                  {v.gender && (
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {v.gender === "male" ? t("dashboard.voiceMale") : t("dashboard.voiceFemale")}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  disabled={loadingId === v.apiName}
                  onClick={(e) => {
                    e.stopPropagation()
                    playSample(v.apiName, v.apiName)
                  }}
                  className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
                >
                  {loadingId === v.apiName ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : playingId === v.apiName ? (
                    <Pause className="h-3.5 w-3.5" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  {playingId === v.apiName ? t("dashboard.pauseSample") : t("dashboard.playSample")}
                </button>
              </div>
            )
          })}
          </div>
          ))}
        </div>
      </div>

      {/* Questions — which details the agent asks callers for */}
      <div className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <p className="text-base font-semibold text-foreground">{t("dashboard.questionsLabel")}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("dashboard.questionsHint")}</p>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {([
            ["collectName", "questionName"],
            ["collectPhone", "questionPhone"],
            ["collectAddress", "questionAddress"],
            ["collectEmergency", "questionEmergency"],
          ] as const).map(([key, labelKey]) => (
            <div key={key} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="text-base text-foreground">{t(`dashboard.${labelKey}`)}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{t(`dashboard.${labelKey}Desc`)}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={questions[key]}
                aria-label={t(`dashboard.${labelKey}`)}
                onClick={() => setQuestions((q) => ({ ...q, [key]: !q[key] }))}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors",
                  questions[key] ? "bg-primary" : "bg-input",
                )}
              >
                <span
                  className={cn(
                    "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                    questions[key] ? "translate-x-5" : "translate-x-0.5",
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Maximum call length — per-call hard cap (kill switch). Slider runs 1 min → Unlimited. */}
      <div className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <p className="text-base font-semibold text-foreground">{t("dashboard.maxCallLabel")}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("dashboard.maxCallHint")}</p>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl"
              aria-label={t("dashboard.maxCallDecrease")}
              onClick={() =>
                setMaxCallMinutes(maxCallMinutes == null ? MAX_CALL_SLIDER_MAX : Math.max(1, maxCallMinutes - 1))
              }
            >
              <Minus className="h-5 w-5" />
            </Button>

            <div className="flex min-w-[7rem] items-baseline justify-center gap-1.5 rounded-xl border border-border bg-secondary/40 px-4 py-2.5">
              {maxCallMinutes == null ? (
                <span className="text-2xl font-bold text-foreground">{t("dashboard.maxCallUnlimited")}</span>
              ) : (
                <>
                  <span className="text-2xl font-bold tabular-nums text-foreground">{maxCallMinutes}</span>
                  <span className="text-sm font-medium text-muted-foreground">{t("dashboard.maxCallUnit")}</span>
                </>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl"
              aria-label={t("dashboard.maxCallIncrease")}
              onClick={() =>
                setMaxCallMinutes(
                  maxCallMinutes == null || maxCallMinutes >= MAX_CALL_SLIDER_MAX ? null : maxCallMinutes + 1,
                )
              }
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          <Slider
            min={1}
            max={MAX_CALL_SLIDER_MAX + 1}
            value={[maxCallMinutes == null ? MAX_CALL_SLIDER_MAX + 1 : Math.min(maxCallMinutes, MAX_CALL_SLIDER_MAX)]}
            onValueChange={(value) => {
              const n = Array.isArray(value) ? value[0] : value
              setMaxCallMinutes(n > MAX_CALL_SLIDER_MAX ? null : n)
            }}
            aria-label={t("dashboard.maxCallLabel")}
            className="py-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>1 {t("dashboard.maxCallUnit")}</span>
            <span>{t("dashboard.maxCallUnlimited")}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
