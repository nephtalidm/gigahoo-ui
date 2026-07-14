"use client"

import { useCallback, useRef, useState } from "react"

export type LiveRole = "user" | "agent"
export type LiveMessage = { role: LiveRole; text: string; id?: number }
export type LiveStatus = "idle" | "connecting" | "live" | "ended" | "error"

// API base -> ws(s):// origin of the Node VoiceAgent (voice.gigahoo.ai).
function voiceWsBase(): string {
  const v = process.env.NEXT_PUBLIC_VOICE_WS_URL
  if (v) return v.replace(/^http/, "ws")
  const api = process.env.NEXT_PUBLIC_API_URL || ""
  if (api) return api.replace(/^http/, "ws").replace("//api.", "//voice.")
  if (typeof window !== "undefined") return window.location.origin.replace(/^http/, "ws")
  return ""
}

// Resample PCM16 @24 kHz -> Float32 @16 kHz (linear). Used to feed Sarah's playback into the 16 kHz
// AEC context. Per-chunk; tiny boundary discontinuities are fine for a loopback reference.
function resample24to16(i16: Int16Array): Float32Array {
  const outLen = Math.floor((i16.length * 16000) / 24000)
  const out = new Float32Array(outLen)
  for (let i = 0; i < outLen; i++) {
    const pos = i * 1.5 // 24000/16000
    const i0 = Math.floor(pos)
    const frac = pos - i0
    const s0 = (i16[i0] ?? 0) / 32768
    const s1 = (i16[i0 + 1] ?? i16[i0] ?? 0) / 32768
    out[i] = s0 + (s1 - s0) * frac
  }
  return out
}

/**
 * Browser live demo, DIRECT to the voice agent — no Telnyx. One WebSocket to /demo/media carries:
 *  - mic audio out: PCM16 16 kHz binary frames (captured via an AudioWorklet)
 *  - agent audio in: PCM16 24 kHz binary frames (played via a jitter-buffered AudioWorklet)
 *  - transcripts/status: JSON text frames
 *
 * Exposes the same shape as useWebrtcDemo so hero.tsx can swap it in directly.
 */
export function useBrowserDemo() {
  const [status, setStatus] = useState<LiveStatus>("idle")
  const [messages, setMessages] = useState<LiveMessage[]>([])
  const [agentSpeaking, setAgentSpeaking] = useState(false)
  const [listening, setListening] = useState(false)
  const [ringing, setRinging] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const micCtxRef = useRef<AudioContext | null>(null)
  const playCtxRef = useRef<AudioContext | null>(null)
  const playNodeRef = useRef<AudioWorkletNode | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const speakTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hangupRef = useRef<HTMLAudioElement | null>(null)
  const ringRef = useRef<HTMLAudioElement | null>(null)
  const liveRef = useRef(false)

  const stopRing = useCallback(() => {
    setRinging(false)
    const r = ringRef.current
    if (r) { try { r.pause(); r.currentTime = 0 } catch {} }
  }, [])

  const cleanup = useCallback(() => {
    stopRing()
    try { wsRef.current?.close() } catch {}
    try { micStreamRef.current?.getTracks().forEach((t) => t.stop()) } catch {}
    try { void micCtxRef.current?.close() } catch {}
    try { void playCtxRef.current?.close() } catch {}
    wsRef.current = null
    micCtxRef.current = null
    playCtxRef.current = null
    playNodeRef.current = null
    micStreamRef.current = null
    if (speakTimer.current) { clearTimeout(speakTimer.current); speakTimer.current = null }
    setAgentSpeaking(false)
  }, [stopRing])

  const stop = useCallback(() => {
    const wasActive = !!wsRef.current
    setStatus((s) => (s === "error" ? s : "ended"))
    if (wasActive) {
      try { wsRef.current?.send(JSON.stringify({ type: "hangup" })) } catch {}
      try {
        const h = hangupRef.current
        if (h) { h.currentTime = 0; h.muted = false; h.volume = 0.5; void h.play().catch(() => {}) }
        else { const bye = new Audio("/sounds/hangup.mp3"); bye.volume = 0.5; void bye.play().catch(() => {}) }
      } catch {}
    }
    setTimeout(() => cleanup(), 0)
  }, [cleanup])

  const handleEvent = useCallback((msg: { type: string; text?: string; status?: string; id?: number }) => {
    if (msg.type === "user" && msg.text) {
      setMessages((m) => [...m, { role: "user", text: msg.text!, id: msg.id }])
    } else if (msg.type === "user_replace" && msg.text) {
      // Swap the placeholder for the omni's clean transcript — target the EXACT bubble by id.
      setMessages((m) => {
        let idx = msg.id != null ? m.findIndex((x) => x.id === msg.id) : -1
        if (idx < 0) for (let i = m.length - 1; i >= 0; i--) if (m[i].role === "user") { idx = i; break }
        if (idx < 0) return [...m, { role: "user", text: msg.text!, id: msg.id }]
        const c = m.slice(); c[idx] = { role: "user", text: msg.text!, id: msg.id }; return c
      })
    } else if (msg.type === "user_remove") {
      // The omni judged the turn invalid (TV/echo) — drop THAT exact placeholder by id.
      setMessages((m) => {
        let idx = msg.id != null ? m.findIndex((x) => x.id === msg.id) : -1
        if (idx < 0 && msg.id == null) for (let i = m.length - 1; i >= 0; i--) if (m[i].role === "user") { idx = i; break }
        if (idx < 0) return m
        const c = m.slice(); c.splice(idx, 1); return c
      })
    } else if (msg.type === "agent" && msg.text) {
      stopRing()
      setMessages((m) => [...m, { role: "agent", text: msg.text! }])
      setAgentSpeaking(true)
      if (speakTimer.current) clearTimeout(speakTimer.current)
      speakTimer.current = setTimeout(() => setAgentSpeaking(false), 2500)
    } else if (msg.type === "clear") {
      setAgentSpeaking(false)
      try { playNodeRef.current?.port.postMessage("clear") } catch {}
    } else if (msg.type === "listening") {
      setListening(true)
    } else if (msg.type === "call_ended") {
      stop()
    }
  }, [stop, stopRing])

  const start = useCallback(async (category: string, _voice: string, locale: string) => {
    setMessages([])
    setAgentSpeaking(false)
    setListening(false)
    setRinging(true)
    liveRef.current = false
    setStatus("connecting")
    // Preload the hangup + ring tones within this click gesture so autoplay is allowed later.
    try {
      const h = new Audio("/sounds/hangup.mp3"); h.muted = true; h.volume = 0.5; hangupRef.current = h
      void h.play().then(() => { h.pause(); h.currentTime = 0; h.muted = false }).catch(() => {})
    } catch {}
    try {
      let ring = ringRef.current
      if (!ring) { ring = new Audio("/sounds/ring.mp3"); ring.loop = true; ring.volume = 0.4; ringRef.current = ring }
      ring.currentTime = 0
      void ring.play().catch(() => {})
    } catch {}

    try {
      // 1. Mic. Echo cancellation is ESSENTIAL — otherwise the omni hears Vincent's voice back and
      //    replies to itself. Request the STRONGEST available canceller: standard AEC (Chrome uses
      //    AEC3 when echoCancellation is on) PLUS the legacy goog- hints that enable the experimental
      //    / stronger canceller where supported (ignored elsewhere). autoGainControl is OFF so AGC
      //    can't boost the near-silent echo residual up to a transcribable level between the caller's
      //    turns. If residual echo still leaks, the robust fix is a server-side ML reference-AEC that
      //    subtracts Vincent's exact PCM (we have it) — see the voice agent.
      // 1. Mic — RAW (echo cancellation OFF). We cancel Sarah's echo server-side (DTLN-AEC) by
      //    subtracting her exact voice, which needs the untouched mic + a sample-aligned loopback.
      const mic = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      })
      micStreamRef.current = mic

      const AC: typeof AudioContext =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext

      // 2. ONE 16 kHz context for BOTH mic capture and Sarah's playback so they share a single clock
      //    (DTLN needs mic + loopback aligned). The aec-io worklet takes the raw mic in, plays Sarah
      //    out, and posts {mic, lpb} PCM16 per quantum.
      const ctx = new AC({ sampleRate: 16000 }); playCtxRef.current = ctx
      await ctx.audioWorklet.addModule("/aec-io-worklet.js")
      const src = ctx.createMediaStreamSource(mic)
      const io = new AudioWorkletNode(ctx, "aec-io", { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1] })
      playNodeRef.current = io
      src.connect(io)
      io.connect(ctx.destination)

      // 3. The single media WebSocket.
      const sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36)
      const url = `${voiceWsBase()}/demo/media?session=${sessionId}&category=${encodeURIComponent(category)}&lang=${encodeURIComponent(locale)}`
      const ws = new WebSocket(url); ws.binaryType = "arraybuffer"; wsRef.current = ws

      // Each quantum: send the aligned mic+lpb concatenated as ONE binary frame (mic half, then lpb).
      io.port.onmessage = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return
        const d = e.data as { mic: ArrayBuffer; lpb: ArrayBuffer }
        const frame = new Uint8Array(d.mic.byteLength + d.lpb.byteLength)
        frame.set(new Uint8Array(d.mic), 0)
        frame.set(new Uint8Array(d.lpb), d.mic.byteLength)
        ws.send(frame.buffer)
      }
      ws.onopen = () => {
        try { ws.send(JSON.stringify({ type: "ready" })) } catch {}
        void ctx.resume()
      }
      ws.onmessage = (e) => {
        if (typeof e.data === "string") {
          try { handleEvent(JSON.parse(e.data)) } catch {}
        } else {
          // Sarah's audio is PCM16 24 kHz — resample to the 16 kHz context rate for the worklet.
          try {
            const r = resample24to16(new Int16Array(e.data as ArrayBuffer))
            playNodeRef.current?.port.postMessage(r.buffer, [r.buffer])
          } catch {}
          liveRef.current = true
          setStatus((s) => (s === "error" || s === "ended" ? s : "live"))
        }
      }
      ws.onerror = () => { if (liveRef.current) stop(); else setStatus("error") }
      ws.onclose = () => { stop() }
    } catch {
      cleanup()
      setStatus("error")
    }
  }, [handleEvent, stop, cleanup])

  return { status, messages, agentSpeaking, listening, ringing, start, stop }
}
