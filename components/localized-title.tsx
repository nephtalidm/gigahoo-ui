"use client"

import { useEffect } from "react"
import { useTranslation } from "@/contexts/language-context"

// Keeps the browser tab title in the active UI language. generateMetadata sets the
// correct localized title for SSR/SEO; this re-applies it on client-side language
// switches (which don't reload the page).
export function LocalizedTitle() {
  const { t, locale } = useTranslation()

  useEffect(() => {
    document.title = t("home.metaTitle")
  }, [t, locale])

  return null
}
