"use client"

import { useEffect, useState } from "react"
import { useTranslation } from "@/contexts/language-context"
import { countries } from "@/lib/data"
import { COUNTRY_COOKIE } from "@/lib/i18n/config"

const isKnown = (code: string | undefined | null): code is string =>
  !!code && countries.some((c) => c.code === code.toUpperCase())

/**
 * Default ISO country code for phone inputs, based on where the visitor is
 * accessing from. Resolution order:
 *   1. NEXT_COUNTRY cookie — set by middleware from the host geo header in
 *      production, or cached here from a prior client-side lookup.
 *   2. Client-side IP geolocation (works in local dev / non-geo hosts).
 *   3. Locale fallback: Spanish (Mexico) -> MX (+52), else US (+1).
 *
 * Starts at "US" for SSR/first paint, then resolves on the client.
 */
export function useDefaultPhoneCountry(): string {
  const { locale } = useTranslation()
  const [country, setCountry] = useState("US")

  useEffect(() => {
    let cancelled = false
    const localeFallback = () => (locale === "es" ? "MX" : "US")

    // 1. Cookie (geo header in prod, or cached from a previous detection).
    const match = document.cookie.match(new RegExp(`(?:^|; )${COUNTRY_COOKIE}=([^;]+)`))
    const cookieCountry = match?.[1]
    if (isKnown(cookieCountry)) {
      setCountry(cookieCountry.toUpperCase())
      return
    }

    // 2. Client-side IP geolocation (CORS-enabled, no API key).
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3000)
    fetch("https://get.geojs.io/v1/ip/country.json", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { country?: string } | null) => {
        if (cancelled) return
        const detected = data?.country?.toUpperCase()
        if (isKnown(detected)) {
          setCountry(detected)
          // Cache so we don't hit the API on every phone field / page load.
          document.cookie = `${COUNTRY_COOKIE}=${detected};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`
        } else {
          setCountry(localeFallback())
        }
      })
      .catch(() => {
        if (!cancelled) setCountry(localeFallback())
      })
      .finally(() => clearTimeout(timer))

    return () => {
      cancelled = true
      clearTimeout(timer)
      controller.abort()
    }
  }, [locale])

  return country
}
