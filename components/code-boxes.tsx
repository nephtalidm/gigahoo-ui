"use client"

import { cn } from "@/lib/utils"

/**
 * A fixed-length numeric code entry rendered as individual boxes, backed by a
 * single hidden input. Shared by the email and SMS verification steps (and
 * reusable anywhere a one-time code is entered).
 */
export function CodeBoxes({
  id,
  value,
  onChange,
  onEscape,
  length = 6,
  autoFocus = true,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  /** Called when Backspace is pressed while empty (e.g. to step back a screen). */
  onEscape?: () => void
  length?: number
  autoFocus?: boolean
}) {
  return (
    <div className="flex justify-center gap-2">
      <input
        id={id}
        inputMode="numeric"
        maxLength={length}
        required
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, length))}
        onKeyDown={(e) => {
          if (e.key === "Backspace" && value.length === 0) onEscape?.()
        }}
        className="absolute -left-[9999px] -top-[9999px] h-0 w-0 opacity-0"
        autoFocus={autoFocus}
      />
      {Array.from({ length }).map((_, i) => (
        <div
          key={i}
          onClick={() => document.getElementById(id)?.focus()}
          className={cn(
            "flex h-14 w-12 cursor-text items-center justify-center rounded-lg border font-mono text-2xl transition-colors",
            value[i]
              ? "border-primary bg-primary/5 text-foreground"
              : "border-border bg-secondary/30 text-muted-foreground",
          )}
        >
          {value[i] || "_"}
        </div>
      ))}
    </div>
  )
}
