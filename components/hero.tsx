"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Loader2, PhoneCall } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/contexts/language-context"
import { COMING_SOON_COUNTRY_CODES } from "@/lib/settings"
import { businessCategories, businessCategoryKeys } from "@/lib/data"
import { useLiveCall } from "@/hooks/use-live-call"

// Timing (ms) for the looping live-call demo animation.
const RINGING_MS = 1500
const TYPING_MS = 1000
const MESSAGE_GAP_MS = 2700
const HOLD_MS = 3000
// Messages shown instantly when the call connects (we join mid-call), so the chat
// is already populated instead of starting empty.
const PREROLL = 2

type CallPhase = "ringing" | "connected"

// mm:ss for the live call timer.
function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])
  return reduced
}

/**
 * Drives the looping "incoming call" simulation.
 * - ringing: pulsing phone icon for RINGING_MS
 * - connected: LIVE badge + messages revealed one at a time, with a typing
 *   indicator before each assistant message
 * - hold: pause after the last message, then reset and loop forever
 * Honours prefers-reduced-motion (all messages shown, no looping).
 */
function useCallAnimation(messageCount: number, reducedMotion: boolean) {
  const [phase, setPhase] = useState<CallPhase>("ringing")
  // Number of messages currently revealed.
  const [visibleCount, setVisibleCount] = useState(0)
  // Whether the typing indicator is showing (before an assistant message).
  const [typing, setTyping] = useState(false)
  // True once the whole conversation has played — the call has wrapped up.
  const [ended, setEnded] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    if (reducedMotion) {
      setPhase("connected")
      setVisibleCount(messageCount)
      setTyping(false)
      setEnded(false)
      return
    }

    const schedule = (fn: () => void, delay: number) => {
      timers.current.push(setTimeout(fn, delay))
    }

    const clearTimers = () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
    }

    const runLoop = () => {
      clearTimers()
      setPhase("ringing")
      setVisibleCount(0)
      setTyping(false)
      setEnded(false)

      // Ringing -> connected, already a few messages into the call.
      schedule(() => {
        setPhase("connected")
        setVisibleCount(PREROLL)
        revealNext(PREROLL)
      }, RINGING_MS)
    }

    // Reveal message `index`; assistant messages (even index) get a typing
    // indicator first. After the last message, hold then loop.
    const revealNext = (index: number) => {
      if (index >= messageCount) {
        // Whole conversation played → mark the call ended, hold, then loop.
        setEnded(true)
        schedule(runLoop, HOLD_MS)
        return
      }

      const isAssistant = index % 2 === 0
      const showMessage = () => {
        setTyping(false)
        setVisibleCount(index + 1)
        schedule(() => revealNext(index + 1), MESSAGE_GAP_MS)
      }

      if (isAssistant) {
        setTyping(true)
        schedule(showMessage, TYPING_MS)
      } else {
        showMessage()
      }
    }

    runLoop()
    return clearTimers
  }, [messageCount, reducedMotion])

  return { phase, visibleCount, typing, ended }
}

export function Hero() {
  const { t, locale } = useTranslation()
  // The visitor's country, read from the same cookie middleware sets for geo.
  const [country, setCountry] = useState<string>("")

  useEffect(() => {
    const country = (document.cookie.match(/(?:^|;\s*)NEXT_COUNTRY=([^;]+)/)?.[1] ?? "").toUpperCase()
    setCountry(country)
  }, [])

  // In "coming soon" markets signup isn't open yet, so the primary CTA is
  // disabled and labeled accordingly.
  const comingSoon = COMING_SOON_COUNTRY_CODES.includes(country)

  const bullets = [
    t("home.heroBullet1"),
    t("home.heroBullet2"),
    t("home.heroBullet3"),
    t("home.heroBullet4"),
  ]

  // Conversation messages. role drives bubble styling/alignment; index order
  // alternates assistant/caller (assistant = even index).
  const messages = [
    { role: "assistant" as const, text: t("home.heroCardMsg1") },
    { role: "caller" as const, text: t("home.heroCardMsg2") },
    { role: "assistant" as const, text: t("home.heroCardMsg3") },
    { role: "caller" as const, text: t("home.heroCardMsg4") },
    { role: "assistant" as const, text: t("home.heroCardMsg5") },
  ]

  const reducedMotion = usePrefersReducedMotion()
  const { phase, visibleCount, typing, ended } = useCallAnimation(messages.length, reducedMotion)
  const connected = phase === "connected"

  // Duration from connect to the last message (only the streamed messages after the
  // preroll), so the missed-calls countdown reaches 0 exactly when the call wraps up.
  const conversationMs =
    messages.slice(PREROLL).reduce((sum, _m, idx) => {
      const i = idx + PREROLL
      return sum + (i % 2 === 0 ? TYPING_MS + MESSAGE_GAP_MS : MESSAGE_GAP_MS)
    }, 0)

  // Keep the newest message in view when the area overflows.
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [visibleCount, typing])

  // Live call timer: counts up while connected, resets when the call ends/loops.
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (reducedMotion) { setElapsed(10); return }
    if (!connected) { setElapsed(0); return }
    if (ended) return // call wrapped up → freeze the timer at its final value
    setElapsed(3) // join mid-call: the timer starts at 0:03, not 0:00
    const iv = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(iv)
  }, [connected, ended, reducedMotion])

  // Missed-calls counter: drops from 120 to 0 once the call is answered,
  // resetting on each loop — the "we catch every call" payoff.
  const [missed, setMissed] = useState(120)
  useEffect(() => {
    if (reducedMotion) { setMissed(0); return }
    if (!connected) { setMissed(120); return }
    // Spread the 120 -> 0 countdown across the whole connected phase so it lands on
    // 0 just as the loop ends, then resets to 120 on the next ring.
    let current = 120
    setMissed(120)
    const iv = setInterval(() => {
      current = Math.max(0, current - 1)
      setMissed(current)
      if (current === 0) clearInterval(iv)
    }, conversationMs / 120)
    return () => clearInterval(iv)
  }, [connected, reducedMotion, conversationMs])

  // Live two-way voice call (real call to the AI agent via the API).
  const live = useLiveCall()
  const liveActive = live.status === "connecting" || live.status === "live"
  const [category, setCategory] = useState(businessCategories[0])

  // Auto-scroll the live transcript to the newest message.
  useEffect(() => {
    if (!liveActive) return
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [live.messages.length, live.agentSpeaking, liveActive])

  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      {/* Background video + dark gradient overlay (darker on the text side) for legibility. */}
      <video
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover"
        src="/hero-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/65 to-black/40" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-8 pb-8 sm:px-6 sm:pt-12 sm:pb-12 lg:pt-14 lg:pb-14">
        <div className="grid items-stretch gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <span className="flex h-1.5 w-1.5 rounded-full bg-white" />
              {t("home.heroBadge")}
            </span>

            <h1 className="mt-6 text-pretty text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t("home.heroTitle")}
            </h1>

            <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-white/85">
              {t("home.heroSubtitle")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {comingSoon ? (
                <Button size="lg" className="text-base" disabled>
                  {t("home.comingSoon")}
                </Button>
              ) : (
                <Button size="lg" className="text-base" render={<Link href="/login">{t("home.heroCtaPrimary")}</Link>} />
              )}
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/5 text-base text-white hover:bg-white/15 hover:text-white"
                render={<a href="#pricing">{t("home.heroCtaSecondary")}</a>}
              />
            </div>

            <p className="mt-3 text-sm text-white/75">{t("home.heroNoCard")}</p>

            <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {bullets.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm font-medium text-white">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-white">
                    <Check className="h-3 w-3" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            {/* On lg the card is absolutely positioned to fill the column from the headline
                (offset past the badge) down to the bullets, so its content can never grow the
                column — the long final message scrolls inside instead. */}
            <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm lg:absolute lg:inset-0 lg:top-[3.25rem] lg:min-h-0">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground ${
                    connected || liveActive ? "" : "animate-pulse"
                  }`}
                >
                  <PhoneCall className="h-5 w-5" />
                </span>
                {liveActive ? (
                  <>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t("home.heroLiveCall")}</p>
                      <p className="text-xs text-muted-foreground">
                        {live.status === "live" ? t("home.heroListening") : t("home.heroConnecting")}
                      </p>
                    </div>
                    {live.status === "live" && (
                      <span className="ml-auto flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                        <span className="h-[5px] w-[5px] rounded-full bg-primary motion-safe:[animation:heroLiveBlink_0.7s_ease-in-out_infinite]" />
                        {t("home.heroCardLive")}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t("home.heroCardIncoming")}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("home.heroCardAnswered")}
                        {connected && <> · {formatTime(elapsed)}</>}
                      </p>
                    </div>
                    {ended ? (
                      <span className="ml-auto flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {t("home.heroCardEnded")}
                      </span>
                    ) : (
                      <span
                        className={`ml-auto flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground transition-opacity duration-300 ${
                          connected ? "opacity-100" : "opacity-0"
                        }`}
                        aria-hidden={!connected}
                      >
                        <span className="h-[5px] w-[5px] rounded-full bg-primary motion-safe:[animation:heroLiveBlink_0.7s_ease-in-out_infinite]" />
                        {t("home.heroCardLive")}
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Live-call controls — between the "Incoming call" header and the conversation. */}
              <div className="mt-4 border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={liveActive}
                    aria-label={t("settings.businessCategory")}
                    className="h-11 sm:h-9 min-w-0 flex-1 truncate rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  >
                    {businessCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {t(`categories.${businessCategoryKeys[cat]}`)}
                      </option>
                    ))}
                  </select>

                  {live.status === "live" ? (
                    <Button variant="destructive" className="h-auto min-h-9 min-w-0 flex-1 whitespace-normal py-1.5 text-center text-xs leading-tight" onClick={() => live.stop()}>
                      {t("home.heroEndCall")}
                    </Button>
                  ) : live.status === "connecting" ? (
                    <Button className="h-auto min-h-9 min-w-0 flex-1 whitespace-normal py-1.5 text-center text-xs leading-tight" disabled>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("home.heroConnecting")}
                    </Button>
                  ) : (
                    <Button className="h-auto min-h-9 min-w-0 flex-1 whitespace-normal bg-black py-1.5 text-center text-xs leading-tight text-white hover:bg-black/90" onClick={() => live.start(category, "Serena", locale)}>
                      {t("home.heroTryLive")}
                    </Button>
                  )}
                </div>
                {live.status === "error" && (
                  <p className="mt-2 text-xs text-destructive">{t("home.heroMicError")}</p>
                )}
              </div>

              {/* Fixed-height chat viewport: never resizes the card; messages bottom-anchor
                  (mt-auto) and auto-scroll to the newest; scrollbar hidden. */}
              <div
                ref={scrollRef}
                className="mt-4 flex h-56 flex-col overflow-y-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:h-auto lg:min-h-0 lg:flex-1"
              >
                {liveActive ? (
                  <div className="mt-auto space-y-3">
                    {live.messages.filter((m) => m.text).map((m, i) => {
                      const isAgent = m.role === "agent"
                      return (
                        <div
                          key={i}
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 ${
                            isAgent
                              ? "rounded-tl-sm bg-muted text-foreground"
                              : "ml-auto rounded-tr-sm bg-primary text-primary-foreground"
                          }`}
                        >
                          {m.text}
                        </div>
                      )
                    })}

                    {live.agentSpeaking ? (
                      <div
                        className="flex max-w-[85%] items-center gap-1 rounded-2xl rounded-tl-sm bg-muted px-4 py-3 motion-safe:animate-in motion-safe:fade-in-0"
                        aria-hidden
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 motion-safe:animate-bounce [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 motion-safe:animate-bounce [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 motion-safe:animate-bounce" />
                      </div>
                    ) : (
                      live.status === "live" && (
                        <p className="text-xs text-muted-foreground">{t("home.heroListening")}</p>
                      )
                    )}
                  </div>
                ) : (
                  <div className="mt-auto space-y-3">
                    {messages.slice(0, visibleCount).map((m, i) => {
                      const isAssistant = m.role === "assistant"
                      return (
                        <div
                          key={i}
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 ${
                            isAssistant
                              ? "rounded-tl-sm bg-muted text-foreground"
                              : "ml-auto rounded-tr-sm bg-primary text-primary-foreground"
                          }`}
                        >
                          {m.text}
                        </div>
                      )
                    })}

                    {typing && (
                      <div
                        className="flex max-w-[85%] items-center gap-1 rounded-2xl rounded-tl-sm bg-muted px-4 py-3 motion-safe:animate-in motion-safe:fade-in-0"
                        aria-hidden
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 motion-safe:animate-bounce [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 motion-safe:animate-bounce [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 motion-safe:animate-bounce" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
                <div>
                  <p className="text-lg font-semibold text-foreground">{t("home.heroStat1Value")}</p>
                  <p className="text-xs text-muted-foreground">{t("home.heroStat1Label")}</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{t("home.heroStat2Value")}</p>
                  <p className="text-xs text-muted-foreground">{t("home.heroStat2Label")}</p>
                </div>
                <div>
                  <p
                    className={`text-lg font-semibold tabular-nums transition-all duration-300 ${
                      missed === 0 ? "scale-125 font-bold text-emerald-600" : "text-foreground"
                    }`}
                  >
                    {missed}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("home.heroStat3Label")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
