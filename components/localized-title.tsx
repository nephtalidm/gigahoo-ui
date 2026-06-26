"use client"

import { useEffect } from "react"
import { useTranslation } from "@/contexts/language-context"

// Keeps the browser tab title in the active UI language. The static metadata
// title (English) is used for SSR/SEO; this updates it client-side to match the
// visitor's chosen/derived language.
export function LocalizedTitle() {
  const { t, locale } = useTranslation()

  useEffect(() => {
    document.title = `Gigahoo — ${t("home.heroBadge")}`
  }, [t, locale])

  return null
}
