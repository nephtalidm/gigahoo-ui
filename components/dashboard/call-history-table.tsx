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
import { type Call, formatDateTime, formatDuration } from "@/lib/data"

export function CallHistoryTable({ calls }: { calls: Call[] }) {
  const [selected, setSelected] = useState<Call | null>(null)

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Caller</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Date / Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Language</TableHead>
              <TableHead className="max-w-xs">Summary</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calls.map((call) => (
              <TableRow
                key={call.id}
                onClick={() => setSelected(call)}
                className="cursor-pointer"
              >
                <TableCell className="font-medium text-foreground">{call.callerName}</TableCell>
                <TableCell className="text-muted-foreground">{call.callerPhone}</TableCell>
                <TableCell className="text-muted-foreground">{formatDateTime(call.dateTime)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDuration(call.durationSeconds)}</TableCell>
                <TableCell className="text-muted-foreground">{call.language}</TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">{call.summary}</TableCell>
                <TableCell>
                  <StatusBadge status={call.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {calls.map((call) => (
          <button
            key={call.id}
            onClick={() => setSelected(call)}
            className="rounded-xl border border-border bg-card p-4 text-left shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-foreground">{call.callerName}</p>
                <p className="text-xs text-muted-foreground">{call.callerPhone}</p>
              </div>
              <StatusBadge status={call.status} />
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{call.summary}</p>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span>{formatDateTime(call.dateTime)}</span>
              <span>·</span>
              <span>{formatDuration(call.durationSeconds)}</span>
              <span>·</span>
              <span>{call.language}</span>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Call Details</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{selected.callerName}</p>
                    <p className="text-sm text-muted-foreground">{selected.callerPhone}</p>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-secondary/40 p-4 text-sm">
                  <DetailItem label="Date / Time" value={formatDateTime(selected.dateTime)} />
                  <DetailItem label="Duration" value={formatDuration(selected.durationSeconds)} />
                  <DetailItem label="Language" value={selected.language} />
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground">Summary</p>
                  <p className="mt-1 text-sm text-muted-foreground">{selected.summary}</p>
                </div>

                {selected.collectedInfo.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Collected Customer Information</p>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {selected.collectedInfo.map((item) => (
                        <li key={item.label} className="flex justify-between gap-4 text-sm">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="text-right font-medium text-foreground">{item.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
