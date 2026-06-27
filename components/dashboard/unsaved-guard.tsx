"use client"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTranslation } from "@/contexts/language-context"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"

/**
 * Shared "unsaved changes" guard. Returns:
 * - `guard(action)`: if there are unsaved edits, opens a confirm dialog and
 *   defers `action` until the user confirms (clearing dirty first); otherwise
 *   runs `action` immediately.
 * - `confirmDialog`: the dialog element to render once in the consuming component.
 *
 * Keeps all the confirm wiring in one place so every navigation entry point
 * (sidebar links, mobile menu, Home Page, Sign out) stays DRY.
 */
export function useUnsavedGuard() {
  const { t } = useTranslation()
  const { dirty, setDirty } = useUnsavedChanges()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<(() => void) | null>(null)

  const guard = useCallback(
    (action: () => void) => {
      if (!dirty) {
        action()
        return
      }
      // Store the action as a thunk so React's setState doesn't call it.
      setPending(() => action)
      setOpen(true)
    },
    [dirty],
  )

  const handleLeave = useCallback(() => {
    setOpen(false)
    setDirty(false)
    pending?.()
    setPending(null)
  }, [pending, setDirty])

  const handleStay = useCallback(() => {
    setOpen(false)
    setPending(null)
  }, [])

  const confirmDialog = (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleStay() }}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("dashboard.unsavedTitle")}</DialogTitle>
          <DialogDescription>{t("dashboard.unsavedMessage")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleStay}>
            {t("dashboard.unsavedStay")}
          </Button>
          <Button
            type="button"
            className="bg-indigo-600 text-white hover:bg-indigo-700"
            onClick={handleLeave}
          >
            {t("dashboard.unsavedLeave")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return { guard, confirmDialog }
}
