"use client"

import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useTranslation } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

import { IDLE_MS, WARN_MS, touchActivity } from "@/lib/session"

/**
 * Signs the user out after 15 minutes of inactivity. At 15 minutes a modal
 * appears with a 2-minute countdown; activity no longer resets it — the user
 * must click "Stay signed in", otherwise they're logged out and sent home.
 */
export function IdleTimeout() {
  const { logout } = useAuth()
  const { t } = useTranslation()
  const [warning, setWarning] = useState(false)
  const [remaining, setRemaining] = useState(WARN_MS)
  // Lets the "Stay signed in" button restart the cycle from outside the effect.
  const extendRef = useRef<() => void>(() => {})

  useEffect(() => {
    let idle: ReturnType<typeof setTimeout>
    let tick: ReturnType<typeof setInterval> | null = null
    let warned = false

    const stopTick = () => {
      if (tick) {
        clearInterval(tick)
        tick = null
      }
    }

    const beginWarning = () => {
      warned = true
      setWarning(true)
      setRemaining(WARN_MS)
      const end = Date.now() + WARN_MS
      tick = setInterval(() => {
        const left = end - Date.now()
        if (left <= 0) {
          stopTick()
          logout() // clears the token and redirects to "/"
        } else {
          setRemaining(left)
        }
      }, 1000)
    }

    const armIdle = () => {
      clearTimeout(idle)
      idle = setTimeout(beginWarning, IDLE_MS)
    }

    const restart = () => {
      warned = false
      setWarning(false)
      stopTick()
      armIdle()
    }
    extendRef.current = restart

    const onActivity = () => {
      if (!warned) {
        armIdle()
        // Persisted (throttled) so the inactivity policy survives tab closes: on the
        // next app load, auth rehydration compares against this timestamp.
        touchActivity()
      }
    }

    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ]
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }))
    armIdle()

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity))
      clearTimeout(idle)
      stopTick()
    }
  }, [logout])

  const mins = Math.floor(remaining / 60000)
  const secs = Math.floor((remaining % 60000) / 1000)

  return (
    <Dialog open={warning} onOpenChange={() => {}}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dashboard.idleTitle")}</DialogTitle>
          <DialogDescription>{t("dashboard.idleDescription")}</DialogDescription>
        </DialogHeader>
        <p className="text-center text-4xl font-bold tabular-nums text-foreground">
          {mins}:{secs.toString().padStart(2, "0")}
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => logout()}>
            {t("dashboard.idleLogoutNow")}
          </Button>
          <Button
            className="bg-indigo-600 text-white hover:bg-indigo-700"
            onClick={() => extendRef.current()}
          >
            {t("dashboard.idleStay")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
