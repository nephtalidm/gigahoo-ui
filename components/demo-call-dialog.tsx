"use client"

import { useEffect, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Gift, Loader2, Mic, PhoneCall, Sparkles, Zap } from "lucide-react"
import { useTranslation } from "@/contexts/language-context"
import { businessCategories, businessCategoryKeys } from "@/lib/data"
import { useBrowserDemo } from "@/hooks/use-browser-demo"

// Cloudflare Turnstile anti-bot gate. Dormant until a site key is configured —
// then the widget renders below the category picker and the Start button stays
// disabled until Cloudflare hands back a token (verified again server-side).
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""
const TURNSTILE_SCRIPT_ID = "cf-turnstile-script"

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      reset: (id?: string) => void
      remove: (id: string) => void
    }
  }
}

/**
 * "Talk to Gigahoo" demo-call popup: centered card over a dark blurred backdrop.
 * Hosts the browser live demo — pick a business type, start a mic call, watch
 * the transcript stream in. Closing the popup always hangs up the call.
 */
export function DemoCallDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t, locale } = useTranslation()
  const live = useBrowserDemo()
  const liveActive = live.status === "connecting" || live.status === "live"
  const [category, setCategory] = useState(businessCategories[0])

  const handleOpenChange = (o: boolean) => {
    if (!o) live.stop()
    onOpenChange(o)
  }

  // Keep the newest transcript line in view.
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [live.messages.length, live.agentSpeaking])

  // Turnstile: render the widget whenever the setup view is visible (it unmounts
  // while the call is live, and tokens are single-use — so re-render each time).
  const showSetup = open && !liveActive
  const [captchaToken, setCaptchaToken] = useState("")
  const turnstileRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (!showSetup || !TURNSTILE_SITE_KEY) return
    let cancelled = false

    const render = () => {
      if (cancelled || widgetIdRef.current || !turnstileRef.current || !window.turnstile) return
      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: "auto",
        language: locale,
        callback: (token: string) => setCaptchaToken(token),
        "expired-callback": () => setCaptchaToken(""),
        "error-callback": () => setCaptchaToken(""),
      })
    }

    let script = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null
    if (window.turnstile) {
      render()
    } else {
      if (!script) {
        script = document.createElement("script")
        script.id = TURNSTILE_SCRIPT_ID
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        script.async = true
        document.head.appendChild(script)
      }
      script.addEventListener("load", render)
    }

    return () => {
      cancelled = true
      script?.removeEventListener("load", render)
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current) } catch { /* already gone */ }
      }
      widgetIdRef.current = null
      setCaptchaToken("")
    }
  }, [showSetup, locale])

  const chips = [
    { icon: Zap, label: t("home.demoChipInstant") },
    { icon: Sparkles, label: t("home.demoChipReal") },
    { icon: Gift, label: t("home.demoChipFree") },
  ]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="gap-0 rounded-3xl p-0 sm:max-w-[420px]"
        overlayClassName="bg-black/60 supports-backdrop-filter:backdrop-blur-sm"
      >
        <div className="px-5 pt-8 pb-5 sm:px-8 sm:pb-7">
          {/* Badge, phone icon, and title — all centered like a call screen. */}
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 ring-1 ring-primary/15">
              <Zap className="h-3 w-3 fill-primary text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                {t("home.demoBadge")}
              </span>
            </span>
            <span
              className={`mt-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md ${
                live.status === "connecting" || live.ringing ? "animate-pulse" : ""
              }`}
            >
              <PhoneCall className="h-6 w-6" />
            </span>
            <DialogTitle className="mt-4 text-2xl leading-none font-bold tracking-tight">
              {t("home.demoTitle")}
            </DialogTitle>
            <DialogDescription className="mt-2 max-w-[300px] text-sm leading-relaxed">
              {t("home.demoSubtitle")}
            </DialogDescription>
          </div>

          {/* Feature chips */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
            {chips.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground ring-1 ring-border"
              >
                <Icon className="h-3 w-3 text-primary/70" />
                {label}
              </span>
            ))}
          </div>

          {liveActive ? (
            <div className="mt-5">
              {/* Status bar above the transcript. */}
              <div className="flex min-h-9 items-center justify-between rounded-t-2xl border border-b-0 border-border bg-secondary/40 px-4 py-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {live.ringing || live.status === "connecting"
                    ? t("home.heroConnecting")
                    : live.listening
                      ? t("home.heroListening")
                      : t("home.heroGreeting")}
                </p>
                {live.status === "live" && !live.ringing && (
                  <span className="flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-medium text-accent-foreground">
                    <span className="h-[5px] w-[5px] rounded-full bg-green-600 motion-safe:[animation:heroLiveBlink_0.7s_ease-in-out_infinite]" />
                    {t("home.heroCardLive")}
                  </span>
                )}
              </div>

              {/* Live transcript — same bubble styling as the hero card. */}
              <div
                ref={scrollRef}
                className="flex h-52 flex-col overflow-y-auto scroll-smooth rounded-b-2xl border border-border bg-card p-3 [scrollbar-width:thin]"
              >
                <div className="mt-auto space-y-3">
                  {live.messages
                    .filter((m) => m.text)
                    .map((m, i) => {
                      const isAgent = m.role === "agent"
                      // "…" is the live placeholder for a caller turn being transcribed —
                      // render animated typing dots until the clean transcript fills it.
                      const isPending = m.text === "…"
                      return (
                        <div
                          key={i}
                          className={`max-w-[85%] break-words rounded-2xl px-4 py-2.5 text-sm motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 ${
                            isAgent
                              ? "rounded-tl-sm bg-muted text-foreground"
                              : "ml-auto rounded-tr-sm bg-primary text-primary-foreground"
                          }`}
                        >
                          {isPending ? (
                            <span className="flex items-center gap-1 py-0.5" aria-hidden>
                              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/70 motion-safe:animate-bounce [animation-delay:-0.3s]" />
                              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/70 motion-safe:animate-bounce [animation-delay:-0.15s]" />
                              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/70 motion-safe:animate-bounce" />
                            </span>
                          ) : (
                            m.text
                          )}
                        </div>
                      )
                    })}

                  {live.agentSpeaking && (
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
              </div>

              {live.ringing || live.status === "connecting" ? (
                <Button className="mt-3 h-11 w-full rounded-2xl" disabled>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("home.heroConnecting")}
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  className="mt-3 h-11 w-full rounded-2xl"
                  onClick={() => live.stop()}
                >
                  {t("home.heroEndCall")}
                </Button>
              )}
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label={t("settings.businessCategory")}
                className="h-12 w-full truncate rounded-2xl border-2 border-border bg-card px-4 text-sm font-medium text-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
              >
                {businessCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {t(`categories.${businessCategoryKeys[cat]}`)}
                  </option>
                ))}
              </select>

              {/* Turnstile widget slot — only takes up space when the gate is armed. */}
              {TURNSTILE_SITE_KEY && (
                <div ref={turnstileRef} className="flex min-h-[65px] items-center justify-center" />
              )}

              <Button
                className="h-12 w-full rounded-2xl text-[15px] font-semibold"
                disabled={!!TURNSTILE_SITE_KEY && !captchaToken}
                onClick={() => live.start(category, "Jennifer", locale, captchaToken || undefined)}
              >
                <PhoneCall className="h-[18px] w-[18px]" />
                {t("home.demoStart")}
              </Button>

              {live.status === "error" && (
                <p className="text-center text-xs text-destructive">{t("home.heroMicError")}</p>
              )}
            </div>
          )}

          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
            <Mic className="h-3 w-3 shrink-0" />
            {t("home.demoMicNote")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
