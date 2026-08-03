"use client"

import { useState, useRef } from "react"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { EmergencyBadge } from "@/components/dashboard/emergency-badge"
import { useTranslation } from "@/contexts/language-context"
import { type Conversation, formatDateTime, formatDuration, formatPhone } from "@/lib/data"
import { Copy, Check, X } from "lucide-react"

// Shared "Conversation Details" popup used by both the call-history table and the
// overview recent-calls list. Controlled: pass the selected conversation (or null) + onClose.
export function ConversationDetailDialog({
  conversation,
  onClose,
  timeZone,
}: {
  conversation: Conversation | null
  onClose: () => void
  timeZone?: string
}) {
  const { t } = useTranslation()
  // Focus the container (not the first link) when the dialog opens.
  const detailRef = useRef<HTMLDivElement>(null)
  const selected = conversation

  return (
    <Dialog open={!!selected} onOpenChange={(o) => !o && onClose()}>
      {/* A FIXED popup shell: the frame, title, and close button never move — the BODY scrolls
          inside (visible scrollbar when needed) and the transcript renders in full, unscrolled.
          The close button matches the mobile menu's (outlined 44px X); the header's divider sits
          BELOW the button with the same margin the button has above it.
          SIZING: the width override must be sm:-prefixed — the base DialogContent carries
          sm:max-w-sm, and an unprefixed max-w-* neither wins in CSS nor gets deduped by
          tailwind-merge (different variant group), so the popup stayed phone-width (384px) on
          desktop. Mobile keeps the base near-full width; sm+ gets a real desktop panel. */}
      <DialogContent className="sm:max-w-2xl max-h-[85dvh] flex flex-col overflow-hidden p-0 gap-0" showCloseButton={false} initialFocus={detailRef}>
        {selected && (
          <>
            <DialogHeader className="min-h-[68px] shrink-0 justify-center border-b border-border px-4 pr-16">
              <DialogTitle>{t("calls.detailsTitle")}</DialogTitle>
            </DialogHeader>
            <DialogClose
              render={
                <Button
                  variant="outline"
                  className="absolute top-3 right-3 size-11"
                  size="icon-sm"
                  aria-label={t("calls.close")}
                />
              }
            >
              <X className="size-6" />
            </DialogClose>
            <div
              ref={detailRef}
              tabIndex={-1}
              className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 outline-none [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/40"
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-foreground">{selected.callerName}</p>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selected.status} />
                  {selected.isEmergency && <EmergencyBadge />}
                </div>
              </div>

              {/* Metadata — date/time · duration · language, three equal columns */}
              <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-secondary/40 p-4 text-sm">
                <DetailItem label={t("calls.dateTime")} value={formatDateTime(selected.dateTime, timeZone)} />
                <DetailItem label={t("calls.duration")} value={formatDuration(selected.durationSeconds)} />
                <DetailItem label={t("calls.language")} value={selected.language} />
              </div>

              {/* Info sections — phone (tap-to-call link) · address (Maps link) · summary */}
              <div>
                <p className="text-sm font-medium text-foreground">{t("calls.phone")}</p>
                {selected.callerPhoneNumber ? (
                  <p className="mt-1 text-sm">
                    <a
                      href={`tel:${selected.callerPhoneNumber}`}
                      className="text-primary underline underline-offset-2 hover:opacity-80"
                    >
                      {formatPhone(selected.callerPhoneNumber)}
                    </a>
                    <CopyButton value={formatPhone(selected.callerPhoneNumber)} />
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">—</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t("calls.address")}</p>
                {selected.address ? (
                  <p className="mt-1 text-sm">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2 hover:opacity-80"
                    >
                      {selected.address}
                    </a>
                    <CopyButton value={selected.address} />
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">—</p>
                )}
              </div>
              <DetailSection label={t("calls.summary")} value={selected.summary || "—"} />

              {/* Full transcript — rendered IN FULL, no inner scroll; the body above scrolls. */}
              {selected.transcript && (
                <div>
                  <p className="text-sm font-medium text-foreground">{t("calls.transcript")}</p>
                  <div className="mt-1 rounded-xl border border-border bg-secondary/40 p-3 text-sm">
                    {selected.transcript.split("\n").map((line, i) => {
                      const m = line.match(/^(Caller|Receptionist):\s*(.*)$/)
                      return (
                        <p key={i} className="mb-1.5 last:mb-0">
                          {m ? (
                            <>
                              <span className="font-semibold">{m[1] === "Caller" ? t("calls.speakerCaller") : t("calls.speakerReceptionist")}:</span>{" "}
                              {m[2]}
                            </>
                          ) : (
                            line
                          )}
                        </p>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-center">
      <div className="text-left">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  )
}

function DetailSection({ label, value }: { label: string; value: string }) {
  const showCopy = value != null && value !== "" && value !== "—"
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
        {value}
        {showCopy && <CopyButton value={value} />}
      </p>
    </div>
  )
}

// Small icon button that copies its value to the clipboard, flashing a check on success.
function CopyButton({ value }: { value: string }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard unavailable (e.g. insecure context) — silently ignore.
    }
  }
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={t("calls.copy")}
      title={t("calls.copy")}
      className="ml-1 inline-flex cursor-pointer align-middle rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}
