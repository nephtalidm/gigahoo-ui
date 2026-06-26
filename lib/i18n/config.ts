export const locales = [
  "en", // English
  "es", // Spanish
  "fr", // French
  "zh", // Mandarin Chinese
  "yue", // Cantonese
  "hi", // Hindi
  "pa", // Punjabi
  "tl", // Tagalog
  "ko", // Korean
  "ja", // Japanese
  "ru", // Russian
  "uk", // Ukrainian
  "ar", // Arabic
  "fa", // Persian
] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "en"

// Cookie the middleware sets and the LanguageProvider reads for the initial locale.
export const LOCALE_COOKIE = "NEXT_LOCALE"

// Cookie the middleware sets with the visitor's detected country (when the host
// provides a geo header), used to default phone country codes.
export const COUNTRY_COOKIE = "NEXT_COUNTRY"

// Cookie set to "1" once the user explicitly picks a language, so the
// middleware's host/geo default no longer overrides their choice.
export const LOCALE_PICKED_COOKIE = "NEXT_LOCALE_PICKED"

// Native display names + a representative flag (ISO country code) per language.
export const LOCALE_META: Record<Locale, { native: string; english: string; flags: string[] }> = {
  en: { native: "English", english: "English", flags: ["gb"] },
  es: { native: "Español", english: "Spanish", flags: ["es"] },
  fr: { native: "Français", english: "French", flags: ["fr"] },
  zh: { native: "中文", english: "Mandarin", flags: ["cn"] },
  yue: { native: "粵語", english: "Cantonese", flags: ["hk"] },
  hi: { native: "हिन्दी", english: "Hindi", flags: ["in"] },
  pa: { native: "ਪੰਜਾਬੀ", english: "Punjabi", flags: ["/flags/punjab.svg"] },
  tl: { native: "Tagalog", english: "Tagalog", flags: ["ph"] },
  ko: { native: "한국어", english: "Korean", flags: ["kr"] },
  ja: { native: "日本語", english: "Japanese", flags: ["jp"] },
  ru: { native: "Русский", english: "Russian", flags: ["ru"] },
  uk: { native: "Українська", english: "Ukrainian", flags: ["ua"] },
  ar: { native: "العربية", english: "Arabic", flags: ["sa"] },
  fa: { native: "فارسی", english: "Persian", flags: ["ir"] },
}

// Right-to-left languages.
const RTL_LOCALES = new Set<Locale>(["ar", "fa"])
export function dirForLocale(locale: Locale): "ltr" | "rtl" {
  return RTL_LOCALES.has(locale) ? "rtl" : "ltr"
}

export function isLocale(value: string | undefined | null): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value)
}

// Country -> default locale. US/Canada default to English and Mexico (plus other
// Spanish-speaking markets) to Spanish, per product requirements; other countries
// map to their primary language when we support it.
const COUNTRY_TO_LOCALE: Record<string, Locale> = {
  // English (explicit per requirement)
  US: "en", CA: "en", GB: "en", AU: "en", NZ: "en", IE: "en",
  // Spanish-speaking markets
  MX: "es", ES: "es", AR: "es", CO: "es", PE: "es", VE: "es", CL: "es",
  EC: "es", GT: "es", CU: "es", BO: "es", DO: "es", HN: "es", PY: "es",
  SV: "es", NI: "es", CR: "es", PA: "es", UY: "es", PR: "es",
  // Others
  FR: "fr", CN: "zh", TW: "zh", SG: "zh", HK: "yue", IN: "hi", PH: "tl",
  KR: "ko", JP: "ja", RU: "ru", UA: "uk", IR: "fa",
  SA: "ar", AE: "ar", EG: "ar", MA: "ar", DZ: "ar", IQ: "ar", JO: "ar",
  KW: "ar", QA: "ar", BH: "ar", OM: "ar", LB: "ar", LY: "ar", TN: "ar",
}

export function localeForCountry(country: string | undefined | null): Locale {
  if (!country) return defaultLocale
  return COUNTRY_TO_LOCALE[country.toUpperCase()] ?? defaultLocale
}

// Map an Accept-Language tag prefix to a supported locale.
function tagToLocale(tag: string): Locale | null {
  const lower = tag.toLowerCase()
  if (lower === "yue" || lower.startsWith("zh-hk") || lower.startsWith("zh-hant")) return "yue"
  if (lower.startsWith("zh")) return "zh"
  if (lower === "fil" || lower.startsWith("tl")) return "tl"
  const primary = lower.split("-")[0]
  if (isLocale(primary)) return primary
  return null
}

// Parse an Accept-Language header and return the best-matching supported locale.
export function localeForAcceptLanguage(header: string | undefined | null): Locale | null {
  if (!header) return null
  const parts = header
    .split(",")
    .map((p) => {
      const [tag, q] = p.trim().split(";q=")
      return { tag, q: q ? parseFloat(q) : 1 }
    })
    .sort((a, b) => b.q - a.q)
  for (const { tag } of parts) {
    const match = tagToLocale(tag)
    if (match) return match
  }
  return null
}
