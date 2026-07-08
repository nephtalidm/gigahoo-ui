"use client"

import { useCallback, useRef, useState } from "react"

export type LiveRole = "user" | "agent"
export type LiveMessage = { role: LiveRole; text: string }
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

  const handleEvent = useCallback((msg: { type: string; text?: string; status?: string }) => {
    if (msg.type === "user" && msg.text) {
      setMessages((m) => [...m, { role: "user", text: msg.text! }])
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
      // 1. Mic (echo cancellation is essential — otherwise the agent hears its own voice back).
      const mic = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
      micStreamRef.current = mic

      const AC: typeof AudioContext =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext

      // 2. Playback context (24 kHz) + jitter-buffered worklet -> speakers.
      const playCtx = new AC({ sampleRate: 24000 }); playCtxRef.current = playCtx
      await playCtx.audioWorklet.addModule("/pcm-playback-worklet.js")
      const playNode = new AudioWorkletNode(playCtx, "pcm-playback"); playNodeRef.current = playNode
      playNode.connect(playCtx.destination)

      // 3. Capture context (16 kHz) + worklet. The worklet is silent, so route it through a
      //    zero-gain sink to the destination purely to keep it pulled by the audio graph.
      const micCtx = new AC({ sampleRate: 16000 }); micCtxRef.current = micCtx
      await micCtx.audioWorklet.addModule("/pcm-capture-worklet.js")
      const src = micCtx.createMediaStreamSource(mic)
      const capNode = new AudioWorkletNode(micCtx, "pcm-capture")
      const sink = micCtx.createGain(); sink.gain.value = 0
      src.connect(capNode); capNode.connect(sink); sink.connect(micCtx.destination)

      // 4. The single media WebSocket.
      const sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36)
      const url = `${voiceWsBase()}/demo/media?session=${sessionId}&category=${encodeURIComponent(category)}&lang=${encodeURIComponent(locale)}`
      const ws = new WebSocket(url); ws.binaryType = "arraybuffer"; wsRef.current = ws

      capNode.port.onmessage = (e) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(e.data as ArrayBuffer)
      }
      ws.onopen = () => {
        try { ws.send(JSON.stringify({ type: "ready" })) } catch {}
        void micCtx.resume(); void playCtx.resume()
      }
      ws.onmessage = (e) => {
        if (typeof e.data === "string") {
          try { handleEvent(JSON.parse(e.data)) } catch {}
        } else {
          try { playNodeRef.current?.port.postMessage(e.data) } catch {}
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
