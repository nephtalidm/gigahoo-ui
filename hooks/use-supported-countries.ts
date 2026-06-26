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
        if (!cancelled && result.length > 0) setCodes(result)
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
