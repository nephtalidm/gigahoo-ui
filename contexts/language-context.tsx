"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { dictionaries } from "@/lib/i18n/dictionaries"
import { LOCALE_COOKIE, defaultLocale, dirForLocale, isLocale, type Locale } from "@/lib/i18n/config"

type LanguageContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  /** Translate a dotted key path, e.g. t("home.heroTitle"). Supports {var} interpolation. */
  t: (key: string, vars?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function resolve(dict: Record<string, unknown>, key: string): string | undefined {
  let node: unknown = dict
  for (const part of key.split(".")) {
    if (node && typeof node === "object" && part in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }
  return typeof node === "string" ? node : undefined
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, name) =>
    name in vars ? String(vars[name]) : `{${name}}`,
  )
}

export function LanguageProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale
  children: React.ReactNode
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`
    // Keep the document in sync so RTL languages (Arabic/Persian) flip layout
    // immediately, without a reload.
    document.documentElement.lang = next
    document.documentElement.dir = dirForLocale(next)
  }, [])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      // Fall back to English, then to the raw key, so a missing translation is
      // visible-but-non-breaking rather than blank.
      const value = resolve(dictionaries[locale], key) ?? resolve(dictionaries[defaultLocale], key)
      return value !== undefined ? interpolate(value, vars) : key
    },
    [locale],
  )

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useTranslation must be used within a LanguageProvider")
  return ctx
}

export { isLocale }
export type { Locale }
