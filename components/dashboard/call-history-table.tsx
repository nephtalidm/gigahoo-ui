"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { EmergencyBadge } from "@/components/dashboard/emergency-badge"
import { useTranslation } from "@/contexts/language-context"
import { type Conversation, formatDateTime, formatDuration, formatPhone } from "@/lib/data"

export function ConversationHistoryTable({ conversations, timeZone }: { conversations: Conversation[]; timeZone?: string }) {
  const [selected, setSelected] = useState<Conversation | null>(null)
  const { t } = useTranslation()
  // Render dates client-side so they show in the VIEWER's local timezone (the server renders in its
  // own TZ — now Singapore). Empty until mounted to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const fmtDate = (iso: string) => (mounted ? formatDateTime(iso, timeZone) : "")

  return (
    <>
      {conversations.length === 0 ? (
        /* Empty state — keep the column headers visible (including on mobile, where
           the card layout would otherwise render nothing) and show a message. The
           header table scrolls horizontally on small screens; the message sits below
           it at full screen width so it stays centered. */
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-center">{t("calls.caller")}</TableHead>
                  <TableHead className="text-center">{t("calls.phone")}</TableHead>
                  <TableHead className="text-center">{t("calls.dateTime")}</TableHead>
                  <TableHead className="text-center">{t("calls.duration")}</TableHead>
                  <TableHead className="text-center">{t("calls.language")}</TableHead>
                  <TableHead className="max-w-xs text-center">{t("calls.summary")}</TableHead>
                  <TableHead className="text-center">{t("calls.status")}</TableHead>
                  <TableHead className="text-center">{t("calls.isEmergency")}</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </div>
          <p className="px-4 py-16 text-center text-sm text-muted-foreground">{t("calls.empty")}</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-center">{t("calls.caller")}</TableHead>
                  <TableHead className="text-center">{t("calls.phone")}</TableHead>
                  <TableHead className="text-center">{t("calls.dateTime")}</TableHead>
                  <TableHead className="text-center">{t("calls.duration")}</TableHead>
                  <TableHead className="text-center">{t("calls.language")}</TableHead>
                  <TableHead className="max-w-xs text-center">{t("calls.summary")}</TableHead>
                  <TableHead className="text-center">{t("calls.status")}</TableHead>
                  <TableHead className="text-center">{t("calls.isEmergency")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversations.map((conv) => (
                  <TableRow
                    key={conv.id}
                    onClick={() => setSelected(conv)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium text-foreground">{conv.callerName}</TableCell>
                    <TableCell className="text-muted-foreground">{formatPhone(conv.callerPhoneNumber)}</TableCell>
                    <TableCell className="text-muted-foreground">{fmtDate(conv.dateTime)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDuration(conv.durationSeconds)}</TableCell>
                    <TableCell className="text-muted-foreground">{conv.language}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{conv.summary}</TableCell>
                    <TableCell>
                      <StatusBadge status={conv.status} />
                    </TableCell>
                    <TableCell className="text-center">
                      {conv.isEmergency ? <EmergencyBadge /> : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelected(conv)}
                className="rounded-xl border border-border bg-card p-4 text-left shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{conv.callerName}</p>
                    <p className="text-xs text-muted-foreground">{formatPhone(conv.callerPhoneNumber)}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusBadge status={conv.status} />
                    {conv.isEmergency && <EmergencyBadge />}
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{conv.summary}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{fmtDate(conv.dateTime)}</span>
                  <span>·</span>
                  <span>{formatDuration(conv.durationSeconds)}</span>
                  <span>·</span>
                  <span>{conv.language}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{t("calls.detailsTitle")}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-foreground">{selected.callerName}</p>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={selected.status} />
                    {selected.isEmergency && <EmergencyBadge />}
                  </div>
                </div>

                {/* Metadata — date/time · duration · language, all in one row */}
                <div className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-secondary/40 p-4 text-sm">
                  <DetailItem label={t("calls.dateTime")} value={fmtDate(selected.dateTime)} />
                  <DetailItem label={t("calls.duration")} value={formatDuration(selected.durationSeconds)} />
                  <DetailItem label={t("calls.language")} value={selected.language} />
                </div>

                {/* Info sections — phone · address (Maps link) · summary */}
                <DetailSection label={t("calls.phone")} value={formatPhone(selected.callerPhoneNumber)} />
                <div>
                  <p className="text-sm font-medium text-foreground">{t("calls.address")}</p>
                  {selected.address ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-sm text-primary underline underline-offset-2 hover:opacity-80"
                    >
                      {selected.address}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">—</p>
                  )}
                </div>
                <DetailSection label={t("calls.summary")} value={selected.summary || "—"} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium text-foreground">{value}</p>
    </div>
  )
}

function DetailSection({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{value}</p>
    </div>
  )
}
