"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTranslation } from "@/contexts/language-context"
import { useSupportedCountries } from "@/hooks/use-supported-countries"
import { countries } from "@/lib/data"
import { COUNTRY_COOKIE, COUNTRY_PICKED_COOKIE, LOCALE_COOKIE, LOCALE_PICKED_COOKIE, localeForCountry } from "@/lib/i18n/config"
import { COMING_SOON_COUNTRY_CODES } from "@/lib/settings"
import { cn } from "@/lib/utils"

// Lookup a country's name from its ISO-2 code.
const COUNTRY_BY_CODE = new Map(countries.map((c) => [c.code, c]))

// Image-based flag (flagcdn) — renders consistently across OSes, unlike emoji
// flags which show as letters (e.g. "CA") on Windows.
function Flag({ code }: { code: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
      alt=""
      width={18}
      height={13}
      className="h-[13px] w-[18px] shrink-0 rounded-[2px] object-cover shadow-sm ring-1 ring-black/5"
    />
  )
}

function readCountryCookie(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)NEXT_COUNTRY=([^;]+)/)
  return match ? decodeURIComponent(match[1]).toUpperCase() : null
}

export function CountrySwitcher({ className }: { className?: string }) {
  const { t } = useTranslation()
  const supported = useSupportedCountries()

  // Translate a country name for the active UI language, falling back to the
  // lib/data English name if the key resolves to the raw key (i.e. untranslated).
  function countryName(code: string): string {
    const key = `countries.${code}`
    const translated = t(key)
    if (translated !== key) return translated
    return COUNTRY_BY_CODE.get(code)?.name ?? code
  }

  // Show supported markets plus "coming soon" ones (so they're selectable even
  // though signup isn't open yet). Supported first, then coming-soon; deduped and
  // limited to codes we can actually label from lib/data.
  const options = [...new Set([...supported, ...COMING_SOON_COUNTRY_CODES])].filter((code) =>
    COUNTRY_BY_CODE.has(code),
  )

  // The active country comes from the NEXT_COUNTRY cookie (set by middleware per
  // host/geo, or by this dropdown). Read it lazily so a re-opened menu shows it
  // immediately. It's validated against the FULL option list (incl. coming-soon)
  // below — so Mexico isn't reset just because it's not in the "supported" list.
  const [current] = useState<string | null>(() =>
    typeof document !== "undefined" ? readCountryCookie() : null,
  )

  if (options.length === 0) return null

  const value = current && options.includes(current) ? current : options[0]
  const selected = COUNTRY_BY_CODE.get(value)

  function onChange(code: string | null) {
    if (!code) return
    const maxAge = 60 * 60 * 24 * 365
    document.cookie = `${COUNTRY_COOKIE}=${code};path=/;max-age=${maxAge};samesite=lax`
    document.cookie = `${LOCALE_COOKIE}=${localeForCountry(code)};path=/;max-age=${maxAge};samesite=lax`
    // Picking a country applies that country's default language, so clear the
    // explicit-pick flag.
    document.cookie = `${LOCALE_PICKED_COOKIE}=;path=/;max-age=0`
    // Mark the country as explicitly chosen so geo domains stop overriding it.
    document.cookie = `${COUNTRY_PICKED_COOKIE}=1;path=/;max-age=${maxAge};samesite=lax`
    window.location.reload()
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label="Country"
        className={cn("h-9 w-auto cursor-pointer gap-2 rounded-full text-sm font-medium", className)}
      >
        <SelectValue>
          {selected ? (
            <span className="flex items-center gap-2">
              <Flag code={value} />
              <span>{countryName(value)}</span>
            </span>
          ) : null}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-auto min-w-[12rem] max-w-[min(20rem,90vw)]">
        {options.map((code) => (
          <SelectItem key={code} value={code}>
            <span className="flex items-center gap-2">
              <Flag code={code} />
              <span>{countryName(code)}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
