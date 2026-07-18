"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CodeBoxes } from "@/components/code-boxes"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Loader2, CheckCircle2 } from "lucide-react"

// THE one code-confirmation popup — email change, phone change, account deletion, signup
// phone verification all share it, so every 6-digit code entry looks and behaves identically.
export function VerifyModal({
  open, id, title, description, waitingLabel, cancelLabel, confirmLabel, resendLabel, codeSentLabel,
  code, setCode, busy, error, onCancel, onConfirm, onResend,
}: {
  open: boolean
  id: string
  title: string
  description: string
  waitingLabel: string
  cancelLabel: string
  confirmLabel: string
  resendLabel: string
  codeSentLabel: string
  code: string
  setCode: (v: string) => void
  busy: boolean
  error: string | null
  onCancel: () => void
  onConfirm: () => void
  onResend: () => void | Promise<void>
}) {
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  async function handleResend() {
    setResending(true)
    setResent(false)
    try {
      await onResend()
      setResent(true)
      setTimeout(() => setResent(false), 3000)
    } finally {
      setResending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <CodeBoxes id={id} value={code} onChange={setCode} length={6} />
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {waitingLabel}
        </div>
        <div className="flex items-center justify-center gap-2 text-sm">
          {resent ? (
            <span className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              {codeSentLabel}
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={busy || resending}
              className="text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
            >
              {resending && <Loader2 className="mr-1 inline h-3.5 w-3.5 animate-spin" />}
              {resendLabel}
            </button>
          )}
        </div>
        {error && <p className="text-center text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            className="bg-indigo-600 text-white hover:bg-indigo-700"
            onClick={onConfirm}
            disabled={busy || code.length < 6}
          >
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
