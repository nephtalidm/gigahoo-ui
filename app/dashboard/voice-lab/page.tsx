"use client"

import { useEffect, useRef, useState } from "react"
import { PageHeader } from "@/components/dashboard/page-header"
import { generateVoiceSample, getLabVoices, type LabData, type LabVoice } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Loader2, Play, Pause } from "lucide-react"

const DEFAULT_TEXT =
  "Hi, thanks for calling! I'm so sorry to hear that — don't worry, I'll get someone out to help you right away."

export default function VoiceLabPage() {
  const [lab, setLab] = useState<LabData | null>(null)
  const [text, setText] = useState(DEFAULT_TEXT)
  const [cosyEmotion, setCosyEmotion] = useState("sad")
  const [qwenPreset, setQwenPreset] = useState("heartbroken")

  const [playingId, setPlayingId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const requestRef = useRef(0)

  useEffect(() => {
    getLabVoices()
      .then(setLab)
      .catch(() => {})
  }, [])

  function stopPlayback() {
    requestRef.current++
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setPlayingId(null)
    setLoadingId(null)
  }

  async function play(id: string, voice: string, style?: string, instruct?: string) {
    if (playingId === id) {
      stopPlayback()
      return
    }
    const t = text.trim()
    if (!t) return
    stopPlayback()
    const reqId = requestRef.current
    setLoadingId(id)
    try {
      const blob = await generateVoiceSample(t, voice, style, instruct)
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

  function VoiceRow({ id, voice, style, instruct, label }: { id: string; voice: string; style?: string; instruct?: string; label: string }) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
        <span className="truncate text-sm font-medium text-foreground">{label}</span>
        <button
          type="button"
          disabled={loadingId === id}
          onClick={() => play(id, voice, style, instruct)}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
        >
          {loadingId === id ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : playingId === id ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          {playingId === id ? "Stop" : "Play"}
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title="Voice Lab" description="Test bench for CosyVoice and Qwen-TTS voices and the emotions that render on Singapore. Sample-only — these do not drive live calls." />

      {/* Test text */}
      <div className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="mb-2 text-base font-semibold text-foreground">Test text</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          rows={3}
          className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* CosyVoice */}
      <div className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-3">
          <p className="text-base font-semibold text-foreground">CosyVoice <span className="text-sm font-normal text-muted-foreground">(cosyvoice-v3-flash · Chinese instruct)</span></p>
          <p className="mt-0.5 text-sm text-muted-foreground">Alex &amp; Lily render emotion best; sad / fearful work far better than high-arousal ones.</p>
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-sm text-muted-foreground">Emotion</label>
          <select
            value={cosyEmotion}
            onChange={(e) => setCosyEmotion(e.target.value)}
            className="w-full max-w-xs cursor-pointer rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            {lab?.cosyvoiceEmotions.map((em) => (
              <option key={em} value={em}>{em}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          {(lab?.cosyvoice ?? []).map((v: LabVoice) => (
            <VoiceRow key={v.apiName} id={`cosy:${v.apiName}:${cosyEmotion}`} voice={v.apiName} style={cosyEmotion} label={`${v.label} (${v.apiName})`} />
          ))}
          {lab && lab.cosyvoice.length === 0 && <p className="text-sm text-muted-foreground">No active CosyVoice voices.</p>}
        </div>
      </div>

      {/* Qwen-TTS */}
      <div className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-3">
          <p className="text-base font-semibold text-foreground">Qwen-TTS <span className="text-sm font-normal text-muted-foreground">(qwen3-tts-instruct-flash-realtime · English instruct)</span></p>
          <p className="mt-0.5 text-sm text-muted-foreground">Low-arousal presets (heartbroken, tearful, gentle, soothing…) render; high-arousal ones don&apos;t.</p>
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-sm text-muted-foreground">Speaking style</label>
          <select
            value={qwenPreset}
            onChange={(e) => setQwenPreset(e.target.value)}
            className="w-full max-w-xs cursor-pointer rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">Neutral (no instruction)</option>
            {(lab?.qwenPresets ?? []).map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          {(lab?.qwenTts ?? []).map((v: LabVoice) => (
            <VoiceRow key={v.apiName} id={`qwen:${v.apiName}:${qwenPreset}`} voice={v.apiName} instruct={qwenPreset || undefined} label={v.label} />
          ))}
          {lab && lab.qwenTts.length === 0 && <p className="text-sm text-muted-foreground">No active Qwen-TTS voices.</p>}
        </div>
      </div>
    </div>
  )
}
