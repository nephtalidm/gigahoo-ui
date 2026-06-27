"use client"

import { useRef } from "react"
import { cn } from "@/lib/utils"

/**
 * A fixed-length numeric code entry rendered as individual editable boxes.
 * - Type left-to-right and focus auto-advances (no clicking the next box).
 * - Click or arrow to any box and retype to fix a single digit — the others stay.
 * - Backspace clears the current digit (or steps back); paste fills across boxes.
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
  /** Called when Backspace is pressed while the first box is empty. */
  onEscape?: () => void
  length?: number
  autoFocus?: boolean
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([])

  const focusBox = (i: number) => {
    const el = refs.current[Math.max(0, Math.min(length - 1, i))]
    el?.focus()
    el?.select()
  }

  // Place one or more digits starting at box `start`, then move focus past them.
  const place = (start: number, raw: string) => {
    const incoming = raw.replace(/\D/g, "")
    if (!incoming) return
    const chars = value.padEnd(length, " ").slice(0, length).split("")
    let i = start
    for (const c of incoming) {
      if (i >= length) break
      chars[i] = c
      i++
    }
    onChange(chars.join("").replace(/\s/g, "").slice(0, length))
    focusBox(i)
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault()
      const chars = value.padEnd(length, " ").slice(0, length).split("")
      if (chars[i] !== " ") {
        chars[i] = " "
        onChange(chars.join("").replace(/\s/g, ""))
      } else if (i > 0) {
        chars[i - 1] = " "
        onChange(chars.join("").replace(/\s/g, ""))
        focusBox(i - 1)
      } else {
        onEscape?.()
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      focusBox(i - 1)
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      focusBox(i + 1)
    }
  }

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          id={i === 0 ? id : undefined}
          ref={(el) => {
            refs.current[i] = el
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          // The first box is the OS autofill target (one-time-code). It must accept
          // the WHOLE code so place() can spread it across the boxes — maxLength={1}
          // would truncate the autofilled value to a single digit. Other boxes keep 1.
          maxLength={i === 0 ? length : 1}
          autoFocus={autoFocus && i === 0}
          value={value[i] ?? ""}
          onChange={(e) => place(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => {
            e.preventDefault()
            place(i, e.clipboardData.getData("text"))
          }}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-14 w-12 rounded-lg border bg-secondary/30 text-center font-mono text-2xl text-foreground caret-primary outline-none transition-colors",
            "focus:border-primary focus:ring-2 focus:ring-primary/30",
            value[i] ? "border-primary bg-primary/5" : "border-border",
          )}
        />
      ))}
    </div>
  )
}
