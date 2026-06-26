"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTranslation } from "@/contexts/language-context"
import { locales, isLocale, LOCALE_META } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"

function Flags({ codes }: { codes: string[] }) {
  return (
    <span className="flex items-center gap-0.5">
      {codes.map((c) => (
        // Local asset (e.g. "/flags/punjab.svg") or a flagcdn country code.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={c}
          src={c.startsWith("/") ? c : `https://flagcdn.com/${c}.svg`}
          alt=""
          width={18}
          height={13}
          className="h-[13px] w-[18px] shrink-0 rounded-[2px] object-cover shadow-sm ring-1 ring-black/5"
        />
      ))}
    </span>
  )
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useTranslation()
  const current = LOCALE_META[locale]

  return (
    <Select value={locale} onValueChange={(v) => { if (isLocale(v)) setLocale(v) }}>
      <SelectTrigger
        aria-label="Language"
        className={cn("h-9 w-auto cursor-pointer gap-2 rounded-full text-sm font-medium", className)}
      >
        <SelectValue>
          <span className="flex items-center gap-2">
            <Flags codes={current.flags} />
            <span>{current.native}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-auto min-w-[14rem] max-w-[min(20rem,90vw)]">
        {locales.map((l) => {
          const meta = LOCALE_META[l]
          return (
            <SelectItem key={l} value={l}>
              <span className="flex items-center gap-2">
                <Flags codes={meta.flags} />
                <span>{meta.native}</span>
                <span className="text-xs text-muted-foreground">{meta.english}</span>
              </span>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
