"use client"

import { useCallback, useRef, useState } from "react"
import type { TelnyxRTC } from "@telnyx/webrtc"

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
const voiceHttpBase = () => voiceWsBase().replace(/^ws/, "http")
const AUDIO_ID = "gigahoo-demo-remote-audio"

/**
 * Browser live demo via a real Telnyx WebRTC call (so Telnyx/Krisp cleans the audio).
 * The browser places a WebRTC call to the demo number, which routes to the Call
 * Control app -> the demo agent. Audio rides WebRTC (the SDK handles mic + playback);
 * the transcript bubbles come over a separate events WS matched by a session id.
 *
 * Exposes the same shape as useLiveCall so hero.tsx can swap it in directly.
 */
export function useWebrtcDemo() {
  const [status, setStatus] = useState<LiveStatus>("idle")
  const [messages, setMessages] = useState<LiveMessage[]>([])
  const [agentSpeaking, setAgentSpeaking] = useState(false)
  // False during the greeting (mic held), true once the greeting finishes and we're
  // actually listening. Drives the "Greeting…" -> "Listening" label.
  const [listening, setListening] = useState(false)
  // True from the moment we start dialing until the agent's first message arrives (ringback
  // playing). Drives the "Connecting…" -> "End call" button switch.
  const [ringing, setRinging] = useState(false)

  const clientRef = useRef<TelnyxRTC | null>(null)
  const callRef = useRef<{ hangup?: () => void } | null>(null)
  const eventsRef = useRef<WebSocket | null>(null)
  const speakTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hangupRef = useRef<HTMLAudioElement | null>(null)
  const audioElRef = useRef<HTMLAudioElement | null>(null)
  const ringRef = useRef<HTMLAudioElement | null>(null) // ringback tone while we wait for the greeting
  // True once the call has gone live. The SDK emits errors during normal teardown too;
  // after a call has connected we treat those as a clean end, not a failure.
  const liveRef = useRef(false)
  const readySentRef = useRef(false) // sent the "ready to greet" signal yet?

  const stopRing = useCallback(() => {
    setRinging(false)
    const r = ringRef.current
    if (r) { try { r.pause(); r.currentTime = 0 } catch {} }
  }, [])

  const cleanup = useCallback(() => {
    stopRing()
    try { callRef.current?.hangup?.() } catch {}
    try { clientRef.current?.disconnect?.() } catch {}
    try { eventsRef.current?.close() } catch {}
    callRef.current = null
    clientRef.current = null
    eventsRef.current = null
    try { if (audioElRef.current) audioElRef.current.srcObject = null } catch {}
    if (speakTimer.current) { clearTimeout(speakTimer.current); speakTimer.current = null }
    setAgentSpeaking(false)
  }, [stopRing])

  const stop = useCallback(() => {
    const wasActive = !!(clientRef.current || callRef.current || eventsRef.current)
    // Flip the UI to ended IMMEDIATELY so the button returns to its ready state at once —
    // don't make it wait on the WebRTC teardown below.
    setStatus((s) => (s === "error" ? s : "ended"))
    // Call-end tone — only if a call was actually active (fires on the agent's
    // auto-hangup as well as a manual stop).
    if (wasActive) {
      try {
        const h = hangupRef.current
        if (h) { h.currentTime = 0; h.muted = false; h.volume = 0.5; void h.play().catch(() => {}) }
        else { const bye = new Audio("/sounds/hangup.mp3"); bye.volume = 0.5; void bye.play().catch(() => {}) }
      } catch {}
    }
    // Defer teardown a tick so React repaints the button before hangup/disconnect run.
    setTimeout(() => cleanup(), 0)
  }, [cleanup])

  const handleEvent = useCallback((msg: { type: string; text?: string; status?: string }) => {
    if (msg.type === "user" && msg.text) {
      setMessages((m) => [...m, { role: "user", text: msg.text! }])
    } else if (msg.type === "agent" && msg.text) {
      stopRing() // agent "picked up" — the greeting is here, stop the ringback
      setMessages((m) => [...m, { role: "agent", text: msg.text! }])
      setAgentSpeaking(true)
      if (speakTimer.current) clearTimeout(speakTimer.current)
      speakTimer.current = setTimeout(() => setAgentSpeaking(false), 2500)
    } else if (msg.type === "clear") {
      setAgentSpeaking(false)
    } else if (msg.type === "status" && msg.status === "live") {
      liveRef.current = true
      setStatus((s) => (s === "error" || s === "ended" ? s : "live"))
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
    readySentRef.current = false
    setStatus("connecting")
    // Preload + unlock the hangup tone within this click gesture, so it can play
    // later when the agent auto-hangs up (that end isn't a user gesture).
    try {
      const h = new Audio("/sounds/hangup.mp3")
      h.muted = true
      h.volume = 0.5
      hangupRef.current = h
      void h.play().then(() => { h.pause(); h.currentTime = 0; h.muted = false }).catch(() => {})
    } catch {}
    // Ringback tone while we wait for the agent to "pick up" (greeting arrives). Starts within
    // this click gesture so autoplay is allowed; loops until the first agent message.
    try {
      let ring = ringRef.current
      if (!ring) { ring = new Audio("/sounds/ring.mp3"); ring.loop = true; ring.volume = 0.4; ringRef.current = ring }
      ring.currentTime = 0
      void ring.play().catch(() => {})
    } catch {}
    try {
      // 1. Short-lived Telnyx login token + the demo destination.
      const r = await fetch(`${voiceHttpBase()}/demo/webrtc-token`)
      if (!r.ok) throw new Error("token")
      const { token, destination } = (await r.json()) as { token: string; destination: string }
      const sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36)

      // 2. Transcript events channel (bubbles), correlated by session id.
      const ev = new WebSocket(`${voiceWsBase()}/demo/events?session=${sessionId}`)
      eventsRef.current = ev
      ev.onmessage = (e) => { try { handleEvent(JSON.parse(e.data)) } catch {} }

      // 3. Hidden <audio> for the agent's voice.
      let audioEl = document.getElementById(AUDIO_ID) as HTMLAudioElement | null
      if (!audioEl) {
        audioEl = document.createElement("audio")
        audioEl.id = AUDIO_ID
        audioEl.autoplay = true
        ;(audioEl as HTMLAudioElement & { playsInline?: boolean }).playsInline = true
        document.body.appendChild(audioEl)
      }
      audioElRef.current = audioEl

      // 4. Telnyx WebRTC — place the call to the demo number with the session context.
      const mod = await import("@telnyx/webrtc") // browser-only SDK, loaded on demand
      const client = new mod.TelnyxRTC({ login_token: token })
      clientRef.current = client
      ;(client as unknown as { remoteElement: string }).remoteElement = AUDIO_ID
      client.on("telnyx.ready", () => {
        if (callRef.current) return // telnyx.ready can fire more than once — place one call only
        // Must be called as a METHOD on the client (client.newCall) so `this` is bound —
        // extracting it into a variable drops the binding and the SDK throws on newCall.
        const c = client as unknown as {
          newCall: (o: Record<string, unknown>) => { hangup?: () => void }
        }
        callRef.current = c.newCall({
          destinationNumber: destination,
          callerNumber: "demo",
          audio: true,
          video: false,
          customHeaders: [
            { name: "X-Session-Id", value: sessionId },
            { name: "X-Category", value: category },
            { name: "X-Lang", value: locale },
          ],
        })
      })
      client.on("telnyx.notification", (n: { call?: { state?: string; remoteStream?: MediaStream } }) => {
        const call = n?.call
        // Explicitly attach + play the agent's audio the moment the remote stream appears
        // (more reliable than remoteElement + autoplay). Idempotent on repeat notifications.
        const el = audioElRef.current
        if (call?.remoteStream && el && el.srcObject !== call.remoteStream) {
          try { el.srcObject = call.remoteStream; void el.play().catch(() => {}) } catch {}
        }
        const st = call?.state
        if (st === "active") {
          liveRef.current = true
          setStatus((s) => (s === "error" || s === "ended" ? s : "live"))
          // Call media is up -> tell the server it's safe to greet now (event-driven, no
          // warmup). Robust: not gated on the remoteStream object, which the SDK may not expose.
          if (!readySentRef.current) {
            readySentRef.current = true
            try { eventsRef.current?.send(JSON.stringify({ type: "ready" })) } catch {}
          }
        }
        if (st === "hangup" || st === "destroy") stop()
      })
      client.on("telnyx.error", () => {
        // A live/ended call tearing down also emits errors — end cleanly, don't show the
        // mic/connection failure. Only a genuine pre-connection error is a real failure.
        if (liveRef.current) stop()
        else setStatus("error")
      })
      client.connect()
    } catch {
      cleanup()
      setStatus("error")
    }
  }, [handleEvent, stop, cleanup])

  return { status, messages, agentSpeaking, listening, ringing, start, stop }
}
