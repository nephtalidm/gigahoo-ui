"use client"

import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSupportedCountries } from "@/hooks/use-supported-countries"
import { countries } from "@/lib/data"
import { COUNTRY_COOKIE, LOCALE_COOKIE, localeForCountry } from "@/lib/i18n/config"
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
  const supported = useSupportedCountries()
  const [current, setCurrent] = useState<string | null>(null)

  // Resolve the active country from the cookie on mount, falling back to the
  // first supported code when absent or unsupported.
  useEffect(() => {
    const cookie = readCountryCookie()
    const fallback = supported[0] ?? null
    setCurrent(cookie && supported.includes(cookie) ? cookie : fallback)
  }, [supported])

  // Only render supported codes we can actually label from lib/data.
  const options = supported.filter((code) => COUNTRY_BY_CODE.has(code))

  if (options.length === 0) return null

  const value = current && options.includes(current) ? current : options[0]
  const selected = COUNTRY_BY_CODE.get(value)

  function onChange(code: string | null) {
    if (!code) return
    const maxAge = 60 * 60 * 24 * 365
    document.cookie = `${COUNTRY_COOKIE}=${code};path=/;max-age=${maxAge};samesite=lax`
    document.cookie = `${LOCALE_COOKIE}=${localeForCountry(code)};path=/;max-age=${maxAge};samesite=lax`
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
              <span>{selected.name}</span>
            </span>
          ) : null}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-auto min-w-[12rem] max-w-[min(20rem,90vw)]">
        {options.map((code) => {
          const country = COUNTRY_BY_CODE.get(code)!
          return (
            <SelectItem key={code} value={code}>
              <span className="flex items-center gap-2">
                <Flag code={code} />
                <span>{country.name}</span>
              </span>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
