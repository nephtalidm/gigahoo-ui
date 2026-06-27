"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, PhoneCall } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/contexts/language-context"
import { COMING_SOON_COUNTRY_CODES } from "@/lib/settings"

// Timing (ms) for the looping live-call demo animation.
const RINGING_MS = 1500
const TYPING_MS = 800
const MESSAGE_GAP_MS = 1000
const HOLD_MS = 2500

type CallPhase = "ringing" | "connected"

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
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    if (reducedMotion) {
      setPhase("connected")
      setVisibleCount(messageCount)
      setTyping(false)
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

      // Ringing -> connected.
      schedule(() => {
        setPhase("connected")
        revealNext(0)
      }, RINGING_MS)
    }

    // Reveal message `index`; assistant messages (even index) get a typing
    // indicator first. After the last message, hold then loop.
    const revealNext = (index: number) => {
      if (index >= messageCount) {
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

  return { phase, visibleCount, typing }
}

export function Hero() {
  const { t } = useTranslation()
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
  ]

  const reducedMotion = usePrefersReducedMotion()
  const { phase, visibleCount, typing } = useCallAnimation(messages.length, reducedMotion)
  const connected = phase === "connected"

  // Keep the newest message in view when the area overflows.
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [visibleCount, typing])

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-8 sm:px-6 sm:pt-12 sm:pb-12 lg:pt-14 lg:pb-14">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
              {t("home.heroBadge")}
            </span>

            <h1 className="mt-6 text-pretty text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {t("home.heroTitle")}
            </h1>

            <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
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
                className="text-base"
                render={<a href="#pricing">{t("home.heroCtaSecondary")}</a>}
              />
            </div>

            <p className="mt-3 text-sm">{t("home.heroNoCard")}</p>

            <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {bullets.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground ${
                    connected ? "" : "animate-pulse"
                  }`}
                >
                  <PhoneCall className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t("home.heroCardIncoming")}</p>
                  <p className="text-xs text-muted-foreground">{t("home.heroCardAnswered")}</p>
                </div>
                <span
                  className={`ml-auto flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground transition-opacity duration-300 ${
                    connected ? "opacity-100" : "opacity-0"
                  }`}
                  aria-hidden={!connected}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary motion-safe:animate-pulse" />
                  {t("home.heroCardLive")}
                </span>
              </div>

              <div ref={scrollRef} className="mt-4 max-h-56 space-y-3 overflow-y-auto">
                {messages.map((m, i) => {
                  const revealed = i < visibleCount
                  const isAssistant = m.role === "assistant"
                  return (
                    <div
                      key={i}
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm transition-all duration-500 ease-out ${
                        isAssistant
                          ? "rounded-tl-sm bg-muted text-foreground"
                          : "ml-auto rounded-tr-sm bg-primary text-primary-foreground"
                      } ${revealed ? "opacity-100 translate-y-0" : "pointer-events-none translate-y-2 opacity-0"}`}
                      aria-hidden={!revealed}
                    >
                      {m.text}
                    </div>
                  )
                })}

                {typing && (
                  <div
                    className="flex max-w-[85%] items-center gap-1 rounded-2xl rounded-tl-sm bg-muted px-4 py-3"
                    aria-hidden
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 motion-safe:animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 motion-safe:animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 motion-safe:animate-bounce" />
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
                  <p className="text-lg font-semibold text-foreground">{t("home.heroStat3Value")}</p>
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
