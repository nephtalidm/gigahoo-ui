"use client"

import { Globe } from "lucide-react"
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
            <Globe className="h-4 w-4 shrink-0" />
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
