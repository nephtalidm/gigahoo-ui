"use client"

import { useCallback, useRef, useState } from "react"

export type LiveRole = "user" | "agent"
export type LiveMessage = { role: LiveRole; text: string }
export type LiveStatus = "idle" | "connecting" | "live" | "ended" | "error"

// API base -> ws(s):// origin. NEXT_PUBLIC_API_URL is the https API origin.
// The live call runs in the Node VoiceAgent (voice.gigahoo.ai), not the .NET API.
function voiceWsBase(): string {
  const v = process.env.NEXT_PUBLIC_VOICE_WS_URL
  if (v) return v.replace(/^http/, "ws")
  // Derive from the API URL: api.gigahoo.ai -> voice.gigahoo.ai.
  const api = process.env.NEXT_PUBLIC_API_URL || ""
  if (api) return api.replace(/^http/, "ws").replace("//api.", "//voice.")
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
  // Agent audio is routed through a WebRTC loopback so the browser's echo canceller
  // references it and removes it from the mic (full-duplex AEC — the caller can still
  // interrupt). These hold that playback path.
  const playTargetRef = useRef<MediaStreamAudioDestinationNode | null>(null)
  const pcRef = useRef<RTCPeerConnection[] | null>(null)
  const echoAudioRef = useRef<HTMLAudioElement | null>(null)
  // Elegant call ring played while connecting, stopped the instant the agent answers.
  const ringRef = useRef<HTMLAudioElement | null>(null)
  // Preloaded + unlocked on the start tap so it reliably plays on End (esp. iOS / no GC).
  const hangupRef = useRef<HTMLAudioElement | null>(null)

  // Fade out and stop the ring.
  const stopRing = useCallback(() => {
    const r = ringRef.current
    if (!r) return
    ringRef.current = null
    try {
      // Quick fade-out then pause, so there's no click as the agent's greeting begins.
      let v = r.volume
      const fade = setInterval(() => {
        v -= 0.15
        if (v <= 0) { clearInterval(fade); try { r.pause() } catch {} }
        else r.volume = v
      }, 30)
    } catch { try { r.pause() } catch {} }
  }, [])

  const stop = useCallback(() => {
    // Call-end tone — only if a call was actually active (not a bare cleanup/unmount).
    if (wsRef.current || streamRef.current) {
      try {
        const h = hangupRef.current
        if (h) {
          h.currentTime = 0
          h.muted = false
          h.volume = 0.5
          void h.play().catch(() => {})
        } else {
          const bye = new Audio("/sounds/hangup.mp3")
          bye.volume = 0.5
          void bye.play().catch(() => {})
        }
      } catch {}
    }
    stopRing()
    try { processorRef.current?.disconnect() } catch {}
    try { sourceRef.current?.disconnect() } catch {}
    try { streamRef.current?.getTracks().forEach((t) => t.stop()) } catch {}
    try { captureCtxRef.current?.close() } catch {}
    try { playCtxRef.current?.close() } catch {}
    try { pcRef.current?.forEach((p) => p.close()) } catch {}
    try { if (echoAudioRef.current) { echoAudioRef.current.pause(); echoAudioRef.current.srcObject = null } } catch {}
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
    pcRef.current = null
    echoAudioRef.current = null
    playTargetRef.current = null
    wsRef.current = null
    setAgentSpeaking(false)
    setStatus((s) => (s === "error" ? s : "ended"))
  }, [stopRing])

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
    stopRing() // agent answered — stop the ring on its first audio
    const buf = ctx.createBuffer(1, pcm.length, 24000)
    const ch = buf.getChannelData(0)
    for (let i = 0; i < pcm.length; i++) ch[i] = pcm[i] / 0x8000
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.connect(playTargetRef.current ?? ctx.destination)
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
  }, [stopRing])

  // The Node VoiceAgent sends one full transcript per completed turn (no deltas), binary
  // PCM16 for agent audio, {type:"clear"} for barge-in, and status/call_ended events.
  const handleEvent = useCallback((msg: { type: string; text?: string; status?: string }) => {
    if (msg.type === "user" && msg.text) {
      setMessages((m) => [...m, { role: "user", text: msg.text! }])
    } else if (msg.type === "agent" && msg.text) {
      setMessages((m) => [...m, { role: "agent", text: msg.text! }])
    } else if (msg.type === "clear") {
      stopAgentAudio() // barge-in: caller started talking — cut the agent off immediately
    } else if (msg.type === "call_ended") {
      stop()
    } else if (msg.type === "status") {
      if (msg.status === "live") setStatus("live")
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
        // Create + unlock the audio contexts synchronously in the tap, BEFORE the getUserMedia
        // await — otherwise iOS Safari leaves them suspended and the agent audio is silent.
        const captureCtx = new AudioContext({ sampleRate: 16000 })
        captureCtxRef.current = captureCtx
        const playCtx = new AudioContext({ sampleRate: 24000 })
        playCtxRef.current = playCtx
        nextStartRef.current = playCtx.currentTime
        void captureCtx.resume()
        void playCtx.resume()

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        })
        streamRef.current = stream

        // WebRTC loopback for echo cancellation (desktop AND iOS): agent audio -> MediaStream
        // -> a local RTCPeerConnection pair -> an <audio> element, so the mic's echo canceller
        // subtracts it. This is what enables barge-in WITHOUT the agent talking to itself.
        // Enabled on iOS too (playsInline + the getUserMedia gesture lets WebRTC playback run);
        // falls back to direct playback if WebRTC is unavailable.
        const playDest = playCtx.createMediaStreamDestination()
        try {
          const pc1 = new RTCPeerConnection()
          const pc2 = new RTCPeerConnection()
          pcRef.current = [pc1, pc2]
          pc1.onicecandidate = (ev) => { if (ev.candidate) pc2.addIceCandidate(ev.candidate).catch(() => {}) }
          pc2.onicecandidate = (ev) => { if (ev.candidate) pc1.addIceCandidate(ev.candidate).catch(() => {}) }
          pc2.ontrack = (ev) => {
            const el = new Audio()
            el.srcObject = ev.streams[0]
            el.autoplay = true
            el.playsInline = true
            echoAudioRef.current = el
            void el.play().catch(() => {})
          }
          playDest.stream.getTracks().forEach((tr) => pc1.addTrack(tr, playDest.stream))
          const offer = await pc1.createOffer()
          await pc1.setLocalDescription(offer)
          await pc2.setRemoteDescription(offer)
          const answer = await pc2.createAnswer()
          await pc2.setLocalDescription(answer)
          await pc1.setRemoteDescription(answer)
          playTargetRef.current = playDest
        } catch {
          playTargetRef.current = null
        }

        // Robotic ring while connecting (a real looping futuristic beep file, not
        // synthesized), stopped the instant the agent answers.
        try {
          const ring = new Audio("/sounds/ring.mp3")
          ring.loop = true
          ring.volume = 0.5
          ringRef.current = ring
          void ring.play().catch(() => {})
        } catch {}

        // Preload + unlock the hangup tone now (still within the start gesture) by playing it
        // muted then pausing — so iOS lets it play later on End, and it can't be GC'd.
        try {
          const hangup = new Audio("/sounds/hangup.mp3")
          hangup.muted = true
          hangupRef.current = hangup
          void hangup
            .play()
            .then(() => { hangup.pause(); hangup.currentTime = 0; hangup.muted = false })
            .catch(() => {})
        } catch {}

        const ws = new WebSocket(
          `${voiceWsBase()}/browser/media?category=${encodeURIComponent(category)}&voice=${encodeURIComponent(voice)}&lang=${encodeURIComponent(language)}`,
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
            if (ws.readyState !== WebSocket.OPEN || ringRef.current) return
            const input = e.inputBuffer.getChannelData(0)
            const pctx = playCtxRef.current
            if (pctx && pctx.currentTime < nextStartRef.current + 0.4) {
              // Agent is still speaking. The loopback AEC keeps its own (echo-cancelled) voice
              // quiet, so forward only a CLEAR, loud barge-in — that lets the caller interrupt
              // without the agent's echo triggering it to talk to itself.
              let sum = 0
              for (let i = 0; i < input.length; i++) sum += input[i] * input[i]
              if (Math.sqrt(sum / input.length) < 0.05) return // quiet during agent speech = echo
            }
            ws.send(floatToPcm16(input).buffer)
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
