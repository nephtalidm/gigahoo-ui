"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTranslation } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { isLocale, LOCALE_META, orderedLocales, type Locale } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"
import { Flag } from "@/components/flag"

export function LanguageSwitcher({
  className,
  onChange,
}: {
  className?: string
  onChange?: (locale: Locale) => void
}) {
  const { locale, setLocale, country } = useTranslation()
  const { account, isAuthenticated } = useAuth()
  const current = LOCALE_META[locale]
  // Order the languages by the account's country when logged in, else the browser's detected country.
  const locales = orderedLocales(isAuthenticated && account?.countryCode ? account.countryCode : country)

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
