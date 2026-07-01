"use client"

import { useState } from "react"
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
import { useTranslation } from "@/contexts/language-context"
import { type Conversation, formatDateTime, formatDuration } from "@/lib/data"

export function ConversationHistoryTable({ conversations }: { conversations: Conversation[] }) {
  const [selected, setSelected] = useState<Conversation | null>(null)
  const { t } = useTranslation()

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
                    <TableCell className="text-muted-foreground">{conv.callerPhoneNumber}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(conv.dateTime)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDuration(conv.durationSeconds)}</TableCell>
                    <TableCell className="text-muted-foreground">{conv.language}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{conv.summary}</TableCell>
                    <TableCell>
                      <StatusBadge status={conv.status} />
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
                    <p className="text-xs text-muted-foreground">{conv.callerPhoneNumber}</p>
                  </div>
                  <StatusBadge status={conv.status} />
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{conv.summary}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{formatDateTime(conv.dateTime)}</span>
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
                  <div>
                    <p className="text-lg font-semibold text-foreground">{selected.callerName}</p>
                    <p className="text-sm text-muted-foreground">{selected.callerPhoneNumber}</p>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-secondary/40 p-4 text-sm">
                  <DetailItem label={t("calls.dateTime")} value={formatDateTime(selected.dateTime)} />
                  <DetailItem label={t("calls.duration")} value={formatDuration(selected.durationSeconds)} />
                  <DetailItem label={t("calls.language")} value={selected.language} />
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground">{t("calls.summary")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{selected.summary}</p>
                </div>
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
