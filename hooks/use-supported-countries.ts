"use client"

import { useEffect, useState } from "react"
import { getSupportedCountryCodes } from "@/lib/api"
import { SUPPORTED_COUNTRY_CODES } from "@/lib/settings"

/**
 * Supported (served) country ISO-2 codes, fetched once from the API
 * (GET /api/countries/supported) so the Country table is the single source of
 * truth for coverage. Falls back to SUPPORTED_COUNTRY_CODES from lib/settings
 * while loading or on error, so the pickers are never empty.
 */
export function useSupportedCountries(): string[] {
  const [codes, setCodes] = useState<string[]>(SUPPORTED_COUNTRY_CODES)

  useEffect(() => {
    let cancelled = false
    getSupportedCountryCodes()
      .then((result) => {
        if (!cancelled && result.length > 0) {
          // Order by the SUPPORTED_COUNTRY_CODES preference (Canada first), so the
          // pickers list/default to Canada regardless of the API's row order.
          const rank = (c: string) => {
            const i = SUPPORTED_COUNTRY_CODES.indexOf(c)
            return i === -1 ? SUPPORTED_COUNTRY_CODES.length : i
          }
          setCodes([...result].sort((a, b) => rank(a) - rank(b)))
        }
      })
      .catch(() => {
        // Keep the settings fallback on error.
      })
    return () => {
      cancelled = true
    }
  }, [])

  return codes
}
