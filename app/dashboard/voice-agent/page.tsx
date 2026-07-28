"use client"

import { useEffect, useRef, useState } from "react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { getAccount, getSettings, updateVoiceSettings, updateQuestions, generateVoiceSample, getVoices, type AgentVoice } from "@/lib/api"
import { useTranslation } from "@/contexts/language-context"
import { useToast } from "@/components/ui/toaster"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Flag } from "@/components/flag"
import { LOCALE_META, isLocale, LANG_ORDER_BY_COUNTRY } from "@/lib/i18n/config"
import { Loader2, CheckCircle2, Play, Pause, Minus, Plus } from "lucide-react"

// The max-call-length slider runs 1..MAX minutes; one step past the top means "Unlimited" (no cap).
const MAX_CALL_SLIDER_MAX = 60


// The browser's detected country (ISO-2) from the NEXT_COUNTRY cookie — used to order languages
// when there's no account country to go on.
function cookieCountry(): string {
  if (typeof document === "undefined") return ""
  return (document.cookie.match(/(?:^|;\s*)NEXT_COUNTRY=([^;]+)/)?.[1] ?? "").toUpperCase()
}

// Order-independent serialization of the per-language map for dirty-tracking comparisons.
function stableMap(m: Record<string, string>): string {
  return JSON.stringify(Object.entries(m).sort(([a], [b]) => a.localeCompare(b)))
}

export default function VoiceAgentPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { dirty, setDirty } = useUnsavedChanges()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [greetingMessage, setGreetingMessage] = useState("")
  const [greetingPlaceholder, setGreetingPlaceholder] = useState("")
  // The raw default greeting (business name substituted, no "Default:" prefix) — what a voice
  // sample speaks when the custom greeting field is empty.
  const [defaultGreeting, setDefaultGreeting] = useState("")
  const [businessKnowledge, setBusinessKnowledge] = useState("")
  // Per-call hard cap in minutes; null = Unlimited (no cap).
  const [maxCallMinutes, setMaxCallMinutes] = useState<number | null>(null)
  const [voices, setVoices] = useState<AgentVoice[]>([])
  // Voice mode: true = Default voice for all languages (Mode 1); false = a voice per language (Mode 2).
  const [usesSingleVoice, setUsesSingleVoice] = useState(true)
  // The default voice (apiName) — used for every language in Mode 1, and the fallback for languages
  // left on "use the default voice" in Mode 2. Always set.
  const [defaultVoice, setDefaultVoice] = useState<string | null>(null)
  // Per-language NATIVE overrides { languageCode -> apiName }. Only languages the user switched to a
  // native voice; a language on "use the default voice" is simply absent (no override, no DB row).
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  // The language currently shown in the per-language section.
  const [activeLang, setActiveLang] = useState<string>("")
  // The account's country (ISO-2), used to order the language tabs; falls back to the browser's.
  const [countryCode, setCountryCode] = useState<string>("")
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
        // The field starts EMPTY for un-customized accounts — the site-wide default (with
        // the account's real business name substituted) shows as a PLACEHOLDER instead,
        // disappearing the moment the user types.
        const greeting = account.greetingMessage ?? ""
        setGreetingMessage(greeting)
        let ph = settings?.defaultGreeting ?? ""
        if (account.businessName) ph = ph.replaceAll("[Name of business]", account.businessName)
        // The placeholder SAYS it's the default, showing exactly what this account's callers
        // hear when no custom greeting is set.
        setGreetingPlaceholder(ph ? t("dashboard.greetingDefaultPrefix") + ph : "")
        // Keep the raw default (no prefix) so a voice sample can speak it when the field is empty.
        setDefaultGreeting(ph)
        setBusinessKnowledge(account.businessKnowledge ?? "")
        // null = Unlimited (slider sits at the top).
        const initialMax = account.maximumCallMinutes
        setMaxCallMinutes(initialMax)
        // The API returns the list pre-ordered and grouped by language; render in that order.
        setVoices(fetchedVoices)
        const langCodes = Array.from(new Set(fetchedVoices.map((v) => v.languageCode ?? "").filter(Boolean)))
        const acctLang = account.accountLanguage ?? ""
        // Order the language tabs by the account's country, else the browser's detected country.
        setCountryCode((account.countryCode || cookieCountry() || "").toUpperCase())
        setUsesSingleVoice(account.usesSingleVoice ?? true)
        // Default voice: the account's saved default if it still exists, else the account language's
        // native default, else any default, else the first voice.
        const savedDefault = account.agentVoice?.trim()
        const initialDefault =
          (savedDefault && fetchedVoices.some((v) => v.apiName === savedDefault) ? savedDefault : null) ??
          fetchedVoices.find((v) => v.languageCode === acctLang && v.isDefault)?.apiName ??
          fetchedVoices.find((v) => v.isDefault)?.apiName ??
          fetchedVoices[0]?.apiName ??
          null
        setDefaultVoice(initialDefault)
        // Per-language overrides: only languages with a saved native pick (that still exists).
        const savedOverrides = account.agentVoicesByLanguage ?? {}
        const initialOverrides: Record<string, string> = {}
        for (const [code, api] of Object.entries(savedOverrides))
          if (fetchedVoices.some((v) => v.apiName === api)) initialOverrides[code] = api
        setOverrides(initialOverrides)
        setActiveLang(langCodes.includes(acctLang) ? acctLang : (langCodes[0] ?? ""))
        const initialQuestions = {
          collectName: account.collectName ?? true,
          collectPhone: account.collectPhone ?? true,
          collectAddress: account.collectAddress ?? true,
          collectEmergency: account.collectEmergency ?? true,
        }
        setQuestions(initialQuestions)
        // Capture the loaded values as the clean baseline.
        baselineRef.current = JSON.stringify({ greetingMessage: greeting, businessKnowledge: account.businessKnowledge ?? "", maxCallMinutes: initialMax, usesSingleVoice: account.usesSingleVoice ?? true, defaultVoice: initialDefault, overrides: stableMap(initialOverrides), questions: initialQuestions })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Report dirty state whenever the editable values diverge from the baseline.
  useEffect(() => {
    setDirty(JSON.stringify({ greetingMessage, businessKnowledge, maxCallMinutes, usesSingleVoice, defaultVoice, overrides: stableMap(overrides), questions }) !== baselineRef.current)
  }, [greetingMessage, businessKnowledge, maxCallMinutes, usesSingleVoice, defaultVoice, overrides, questions, setDirty])

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
    // Speak the custom greeting, or the default greeting when the field is left empty (so a
    // sample always plays). Only truly nothing to synthesize if there's no default either.
    const text = greetingMessage.trim() || defaultGreeting.trim()
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
        businessKnowledge: businessKnowledge.trim() ? businessKnowledge.trim() : null,
        usesSingleVoice,
        // The default voice, plus only the languages set to a native voice (Mode 2). In Mode 1 the
        // overrides are still stored so switching to Mode 2 restores them.
        agentVoice: defaultVoice,
        agentVoicesByLanguage: overrides,
        maximumCallMinutes,
      })
      await updateQuestions(questions)
      // The saved values are now the clean baseline → clears the dirty guard.
      baselineRef.current = JSON.stringify({ greetingMessage, businessKnowledge, maxCallMinutes, usesSingleVoice, defaultVoice, overrides: stableMap(overrides), questions })
      setDirty(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // Leave the current values in place so the user can retry — and SAY it failed:
      // a silent failure reads as saved, then the unsaved-changes guard looks broken.
      toast({ title: t("dashboard.saveFailed"), variant: "destructive" })
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

  // Language order for the account's country (else the browser's country, else the US default).
  const langOrder = LANG_ORDER_BY_COUNTRY[countryCode] ?? LANG_ORDER_BY_COUNTRY.US
  const langRank = (code: string) => { const i = (langOrder as readonly string[]).indexOf(code); return i === -1 ? 999 : i }

  // The languages the voice catalog covers — one tab each, ordered by the account's country.
  const voiceLangs = Array.from(
    voices.reduce((m, v) => {
      const code = v.languageCode ?? ""
      if (code && !m.has(code)) m.set(code, v.language ?? code)
      return m
    }, new Map<string, string>()),
  )
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => langRank(a.code) - langRank(b.code))

  // A language's tab/dropdown title in the ACCOUNT's language (voiceLang<Name> dictionary keyed on
  // the API's English name; native name as fallback), and its flag (locale flag, else the code as a
  // flagcdn country code for voice-only languages like "de").
  const langTitle = (code: string, name: string) => {
    const key = `dashboard.voiceLang${name}`
    const tr = t(key)
    return tr === key ? (isLocale(code) ? LOCALE_META[code].native : name) : tr
  }
  const langFlag = (code: string) => (isLocale(code) ? LOCALE_META[code].flags[0] : code)

  const voiceByApi = (apiName: string | null) => (apiName ? voices.find((v) => v.apiName === apiName) : undefined)
  const descOf = (apiName: string) => { const k = `dashboard.voiceDescriptions.${apiName}`; const tr = t(k); return tr === k ? "" : tr }
  const nativeDefaultFor = (code: string) => voices.find((v) => (v.languageCode ?? "") === code && v.isDefault)?.apiName
  const defaultVoiceObj = voiceByApi(defaultVoice)

  // A selectable voice row (radio + name + optional gender/description + optional Play button).
  const voiceRow = (opts: { key: string; selected: boolean; onSelect: () => void; label: string; gender?: string | null; desc?: string; playApi?: string }) => (
    <div
      key={opts.key}
      role="button"
      tabIndex={0}
      onClick={opts.onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); opts.onSelect() } }}
      className={cn(
        "flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-4 transition-colors",
        opts.selected ? "border-primary bg-primary/5" : "border-border hover:bg-accent",
      )}
    >
      <div className="flex items-start gap-3 min-w-0">
        <span className={cn("mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border", opts.selected ? "border-primary" : "border-muted-foreground/40")}>
          {opts.selected && <span className="h-2 w-2 rounded-full bg-primary" />}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-foreground">{opts.label}</span>
            {opts.gender && (
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {opts.gender === "male" ? t("dashboard.voiceMale") : t("dashboard.voiceFemale")}
              </span>
            )}
          </div>
          {opts.desc && <p className="mt-0.5 text-xs text-muted-foreground">{opts.desc}</p>}
        </div>
      </div>
      {opts.playApi && (
        <button
          type="button"
          disabled={loadingId === opts.playApi}
          onClick={(e) => { e.stopPropagation(); playSample(opts.playApi!, opts.playApi!) }}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 self-center rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
        >
          {loadingId === opts.playApi ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : playingId === opts.playApi ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playingId === opts.playApi ? t("dashboard.pauseSample") : t("dashboard.playSample")}
        </button>
      )}
    </div>
  )

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
          placeholder={greetingPlaceholder}
          maxLength={100}
          rows={3}
          className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Agent voice — one tab per language (flag + name), each with its own selectable voices. */}
      <div className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <p className="text-base font-semibold text-foreground">{t("dashboard.voiceLabel")}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("dashboard.voiceHint")}</p>
        </div>
        {/* Voice mode: one voice for every language, or a distinct voice per language. */}
        <div className="mb-4">
          <div className="flex w-full rounded-lg border border-border bg-muted/40 p-0.5 sm:inline-flex sm:w-auto">
            {[
              { v: true, label: t("dashboard.voiceModeSingle") },
              { v: false, label: t("dashboard.voiceModePerLanguage") },
            ].map((m) => (
              <button
                key={String(m.v)}
                type="button"
                onClick={() => setUsesSingleVoice(m.v)}
                className={cn(
                  "flex-1 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:flex-none",
                  usesSingleVoice === m.v
                    ? "bg-indigo-600 text-white shadow-sm dark:bg-indigo-500"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {usesSingleVoice ? t("dashboard.voiceModeSingleHint") : t("dashboard.voiceModePerLanguageHint")}
          </p>
        </div>
        {/* Default voice — used for every language in Mode 1, and the fallback in Mode 2. Always enabled. */}
        <div className="mb-6">
          <p className="text-sm font-medium text-foreground">{t("dashboard.voiceDefaultLabel")}</p>
          <div className="mt-2 flex items-center gap-2">
            <Select value={defaultVoice ?? ""} onValueChange={(v) => { if (v) setDefaultVoice(v as string) }}>
              <SelectTrigger className="w-full cursor-pointer sm:max-w-md">
                <SelectValue>
                  {defaultVoiceObj && (
                    <span className="flex items-center gap-2">
                      <Flag code={langFlag(defaultVoiceObj.languageCode ?? "")} />
                      <span className="font-medium">{defaultVoiceObj.label}</span>
                      <span className="text-xs text-muted-foreground">· {langTitle(defaultVoiceObj.languageCode ?? "", defaultVoiceObj.language ?? "")}</span>
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {voiceLangs.map(({ code, name }) => (
                  <SelectGroup key={code}>
                    <SelectLabel>
                      <span className="flex items-center gap-2"><Flag code={langFlag(code)} />{langTitle(code, name)}</span>
                    </SelectLabel>
                    {voices.filter((v) => (v.languageCode ?? "") === code).map((v) => (
                      <SelectItem key={v.apiName} value={v.apiName}>
                        <span className="flex items-center gap-2">
                          <span>{v.label}</span>
                          {v.gender && <span className="text-xs text-muted-foreground">{v.gender === "male" ? t("dashboard.voiceMale") : t("dashboard.voiceFemale")}</span>}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            {defaultVoice && (
              <button
                type="button"
                disabled={loadingId === defaultVoice}
                onClick={() => playSample(defaultVoice, defaultVoice)}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
              >
                {loadingId === defaultVoice ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : playingId === defaultVoice ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {playingId === defaultVoice ? t("dashboard.pauseSample") : t("dashboard.playSample")}
              </button>
            )}
          </div>
          {defaultVoiceObj && descOf(defaultVoiceObj.apiName) && (
            <p className="mt-1.5 text-xs text-muted-foreground">{descOf(defaultVoiceObj.apiName)}</p>
          )}
        </div>

        {/* A voice per language — enabled only in Mode 2; disabled (greyed) in Mode 1. */}
        {voiceLangs.length > 0 && (
        <div className={cn("transition-opacity", usesSingleVoice && "pointer-events-none select-none opacity-50")} aria-disabled={usesSingleVoice}>
          <p className="text-sm font-medium text-foreground">{t("dashboard.voiceModePerLanguage")}</p>
          <div className="mt-2">
            <Select value={activeLang} onValueChange={(v) => setActiveLang((v as string) ?? "")}>
              <SelectTrigger className="w-full cursor-pointer sm:w-auto sm:min-w-[15rem]">
                <SelectValue>
                  <span className="flex items-center gap-2">
                    <Flag code={langFlag(activeLang)} />
                    <span>{langTitle(activeLang, voiceLangs.find((l) => l.code === activeLang)?.name ?? activeLang)}</span>
                    {activeLang in overrides && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {voiceLangs.map(({ code, name }) => (
                  <SelectItem key={code} value={code}>
                    <span className="flex items-center gap-2">
                      <Flag code={langFlag(code)} />
                      <span>{langTitle(code, name)}</span>
                      {code in overrides && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Per language: use the default voice, or choose a native voice (native default pre-selected). */}
          <div className="mt-3 flex flex-col gap-2">
            {voiceRow({
              key: "__default__",
              selected: !(activeLang in overrides),
              onSelect: () => setOverrides((o) => { const n = { ...o }; delete n[activeLang]; return n }),
              label: t("dashboard.voicePerLangDefault"),
              desc: defaultVoiceObj?.label,
            })}
            {voiceRow({
              key: "__native__",
              selected: activeLang in overrides,
              onSelect: () => setOverrides((o) =>
                activeLang in o ? o : { ...o, [activeLang]: nativeDefaultFor(activeLang) ?? voices.find((v) => (v.languageCode ?? "") === activeLang)?.apiName ?? "" }),
              label: t("dashboard.voicePerLangNative", { language: langTitle(activeLang, voiceLangs.find((l) => l.code === activeLang)?.name ?? activeLang) }),
            })}
            {activeLang in overrides && (
              <div className="ml-4 flex flex-col gap-2 border-l-2 border-border pl-4">
                {voices.filter((v) => (v.languageCode ?? "") === activeLang).map((v) =>
                  voiceRow({
                    key: v.apiName,
                    selected: overrides[activeLang] === v.apiName,
                    onSelect: () => setOverrides((o) => ({ ...o, [activeLang]: v.apiName })),
                    label: v.label,
                    gender: v.gender,
                    desc: descOf(v.apiName),
                    playApi: v.apiName,
                  }),
                )}
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Business knowledge — owner-provided facts the agent answers caller questions from */}
      <div className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-3">
          <p className="text-base font-semibold text-foreground">{t("dashboard.knowledgeLabel")}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("dashboard.knowledgeHint")}</p>
        </div>
        <textarea
          value={businessKnowledge}
          onChange={(e) => setBusinessKnowledge(e.target.value)}
          placeholder={t("dashboard.knowledgePlaceholder")}
          maxLength={2000}
          rows={6}
          className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">{businessKnowledge.length}/2000</p>
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
          {/* Minute marks positioned along the slider scale (thumb travels 1 → Unlimited) so the
              user can gauge where to drag for a given length. Middle ticks at 15/30/45 min. */}
          <div className="relative mt-1 h-8 text-xs text-muted-foreground">
            <div className="absolute left-0 top-0 flex flex-col items-start gap-1">
              <span className="h-1.5 w-px bg-border" />
              <span>1 {t("dashboard.maxCallUnit")}</span>
            </div>
            {[15, 30, 45].map((v) => (
              <div
                key={v}
                className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1"
                style={{ left: `${((v - 1) / MAX_CALL_SLIDER_MAX) * 100}%` }}
              >
                <span className="h-1.5 w-px bg-border" />
                <span className="tabular-nums">{v}</span>
              </div>
            ))}
            <div className="absolute right-0 top-0 flex flex-col items-end gap-1">
              <span className="h-1.5 w-px bg-border" />
              <span>{t("dashboard.maxCallUnlimited")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
