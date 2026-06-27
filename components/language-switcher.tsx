"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTranslation } from "@/contexts/language-context"
import { locales, isLocale, LOCALE_META, type Locale } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"

// The single, most-common flag for a language (e.g. UK for English, Spain for
// Spanish, Punjab for Punjabi). Country selection lives in its own dropdown.
function Flag({ code }: { code: string }) {
  return (
    // Local asset (e.g. "/flags/punjab.svg") or a flagcdn country code.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={code.startsWith("/") ? code : `https://flagcdn.com/${code}.svg`}
      alt=""
      width={18}
      height={13}
      className="h-[13px] w-[18px] shrink-0 rounded-[2px] object-cover shadow-sm ring-1 ring-black/5"
    />
  )
}

export function LanguageSwitcher({
  className,
  onChange,
}: {
  className?: string
  onChange?: (locale: Locale) => void
}) {
  const { locale, setLocale } = useTranslation()
  const current = LOCALE_META[locale]

  return (
    <Select value={locale} onValueChange={(v) => { if (isLocale(v)) { setLocale(v); onChange?.(v) } }}>
      <SelectTrigger
        aria-label="Language"
        className={cn("h-9 w-auto cursor-pointer gap-2 rounded-full text-sm font-medium", className)}
      >
        <SelectValue>
          <span className="flex items-center gap-2">
            <Flag code={current.flags[0]} />
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
                <Flag code={meta.flags[0]} />
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
