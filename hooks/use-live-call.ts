"use client"

import { useCallback, useRef, useState } from "react"

export type LiveRole = "user" | "agent"
export type LiveMessage = { role: LiveRole; text: string }
export type LiveStatus = "idle" | "connecting" | "live" | "ended" | "error"

// API base -> ws(s):// origin. NEXT_PUBLIC_API_URL is the https API origin.
function wsBase(): string {
  const api = process.env.NEXT_PUBLIC_API_URL || ""
  if (api) return api.replace(/^http/, "ws")
  // Fallback: same origin (dev).
  if (typeof window !== "undefined") return window.location.origin.replace(/^http/, "ws")
  return ""
}

// Float32 [-1,1] -> Int16LE PCM.
function floatToPcm16(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length)
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]))
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return out
}

/**
 * Live two-way voice call with the AI agent, proxied through the API
 * (GET /api/voice/live as a WebSocket). Captures the mic at 16 kHz PCM16, streams
 * it up, and plays the 24 kHz PCM16 audio that comes back gaplessly. Transcripts
 * arrive as JSON text frames and accumulate into `messages`.
 */
export function useLiveCall() {
  const [status, setStatus] = useState<LiveStatus>("idle")
  const [messages, setMessages] = useState<LiveMessage[]>([])
  const [agentSpeaking, setAgentSpeaking] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const captureCtxRef = useRef<AudioContext | null>(null)
  const playCtxRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  // Schedule clock for back-to-back playback buffers.
  const nextStartRef = useRef(0)
  // Active playback sources, so a barge-in can stop them instantly.
  const sourcesRef = useRef<AudioBufferSourceNode[]>([])
  // Whether the current agent turn is still streaming (append deltas) or done.
  const agentTurnOpenRef = useRef(false)

  const stop = useCallback(() => {
    try { processorRef.current?.disconnect() } catch {}
    try { sourceRef.current?.disconnect() } catch {}
    try { streamRef.current?.getTracks().forEach((t) => t.stop()) } catch {}
    try { captureCtxRef.current?.close() } catch {}
    try { playCtxRef.current?.close() } catch {}
    try {
      if (wsRef.current && wsRef.current.readyState <= WebSocket.OPEN) {
        try { wsRef.current.send(JSON.stringify({ type: "hangup" })) } catch {}
        wsRef.current.close()
      }
    } catch {}
    processorRef.current = null
    sourceRef.current = null
    streamRef.current = null
    captureCtxRef.current = null
    playCtxRef.current = null
    wsRef.current = null
    setAgentSpeaking(false)
    setStatus((s) => (s === "error" ? s : "ended"))
  }, [])

  // Barge-in: stop and flush any agent audio currently playing or queued.
  const stopAgentAudio = useCallback(() => {
    for (const s of sourcesRef.current) {
      try { s.onended = null; s.stop() } catch {}
    }
    sourcesRef.current = []
    if (playCtxRef.current) nextStartRef.current = playCtxRef.current.currentTime
    setAgentSpeaking(false)
  }, [])

  const playPcm = useCallback((pcm: Int16Array) => {
    const ctx = playCtxRef.current
    if (!ctx || pcm.length === 0) return
    const buf = ctx.createBuffer(1, pcm.length, 24000)
    const ch = buf.getChannelData(0)
    for (let i = 0; i < pcm.length; i++) ch[i] = pcm[i] / 0x8000
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.connect(ctx.destination)
    const startAt = Math.max(ctx.currentTime + 0.02, nextStartRef.current)
    src.start(startAt)
    nextStartRef.current = startAt + buf.duration
    sourcesRef.current.push(src)
    setAgentSpeaking(true)
    src.onended = () => {
      sourcesRef.current = sourcesRef.current.filter((s) => s !== src)
      // Last buffer in the queue finished -> agent stopped speaking.
      if (nextStartRef.current <= (playCtxRef.current?.currentTime ?? 0) + 0.06) {
        setAgentSpeaking(false)
      }
    }
  }, [])

  const handleEvent = useCallback((msg: { type: string; text?: string; message?: string }) => {
    if (msg.type === "user" && msg.text) {
      // Merge consecutive caller fragments (VAD can split one utterance) into one bubble.
      setMessages((m) => {
        const last = m[m.length - 1]
        if (last && last.role === "user") {
          return [...m.slice(0, -1), { role: "user", text: `${last.text} ${msg.text!}`.trim() }]
        }
        return [...m, { role: "user", text: msg.text! }]
      })
    } else if (msg.type === "agent" && msg.text) {
      setMessages((m) => {
        // While the agent turn is open, append to the agent's CURRENT bubble even if a
        // (late) caller transcript landed after it — so one sentence never splits in two.
        if (agentTurnOpenRef.current) {
          for (let i = m.length - 1; i >= 0; i--) {
            if (m[i].role === "agent") {
              const copy = m.slice()
              copy[i] = { role: "agent", text: copy[i].text + msg.text! }
              return copy
            }
          }
        }
        agentTurnOpenRef.current = true
        return [...m, { role: "agent", text: msg.text! }]
      })
    } else if (msg.type === "agent_done") {
      agentTurnOpenRef.current = false
    } else if (msg.type === "speech_started") {
      stopAgentAudio() // barge-in: caller started talking — cut the agent off immediately
    } else if (msg.type === "call_ended") {
      stop()
    } else if (msg.type === "error") {
      setStatus("error")
    }
  }, [stopAgentAudio, stop])

  const start = useCallback(
    async (category: string, voice: string, language: string) => {
      setMessages([])
      setStatus("connecting")
      agentTurnOpenRef.current = false
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        })
        streamRef.current = stream

        const captureCtx = new AudioContext({ sampleRate: 16000 })
        captureCtxRef.current = captureCtx
        const playCtx = new AudioContext({ sampleRate: 24000 })
        playCtxRef.current = playCtx
        nextStartRef.current = playCtx.currentTime

        const ws = new WebSocket(
          `${wsBase()}/api/voice/live?category=${encodeURIComponent(category)}&voice=${encodeURIComponent(voice)}&lang=${encodeURIComponent(language)}`,
        )
        ws.binaryType = "arraybuffer"
        wsRef.current = ws

        ws.onopen = () => {
          setStatus("live")
          const source = captureCtx.createMediaStreamSource(stream)
          sourceRef.current = source
          const processor = captureCtx.createScriptProcessor(4096, 1, 1)
          processorRef.current = processor
          processor.onaudioprocess = (e) => {
            if (ws.readyState !== WebSocket.OPEN) return
            const pcm = floatToPcm16(e.inputBuffer.getChannelData(0))
            ws.send(pcm.buffer)
          }
          source.connect(processor)
          // Route through a muted gain so onaudioprocess fires without echoing the mic.
          const sink = captureCtx.createGain()
          sink.gain.value = 0
          processor.connect(sink)
          sink.connect(captureCtx.destination)
        }
        ws.onmessage = (ev) => {
          if (typeof ev.data === "string") {
            try { handleEvent(JSON.parse(ev.data)) } catch {}
          } else {
            playPcm(new Int16Array(ev.data as ArrayBuffer))
          }
        }
        ws.onerror = () => { setStatus("error"); stop() }
        ws.onclose = () => stop()
      } catch {
        setStatus("error")
        stop()
      }
    },
    [handleEvent, playPcm, stop],
  )

  return { status, messages, agentSpeaking, start, stop }
}
