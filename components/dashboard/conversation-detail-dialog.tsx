"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { EmergencyBadge } from "@/components/dashboard/emergency-badge"
import { useTranslation } from "@/contexts/language-context"
import { type Conversation, formatDateTime, formatDuration, formatPhone } from "@/lib/data"
import { Copy, Check } from "lucide-react"

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
      <DialogContent className="max-w-lg" initialFocus={detailRef}>
        {selected && (
          <>
            <DialogHeader>
              <DialogTitle>{t("calls.detailsTitle")}</DialogTitle>
            </DialogHeader>
            <div ref={detailRef} tabIndex={-1} className="flex flex-col gap-4 outline-none">
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

              {/* Info sections — phone · address (Maps link) · summary */}
              <DetailSection label={t("calls.phone")} value={formatPhone(selected.callerPhoneNumber)} />
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

              {/* Full transcript — every turn, scrollable; speaker prefix bolded */}
              {selected.transcript && (
                <div>
                  <p className="text-sm font-medium text-foreground">{t("calls.transcript")}</p>
                  <div className="mt-1 max-h-64 overflow-y-auto rounded-xl border border-border bg-secondary/40 p-3 text-sm">
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
