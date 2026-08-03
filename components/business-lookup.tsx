"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { loadMaps, MAPS_KEY } from "@/components/address-autocomplete"
import { useTranslation } from "@/contexts/language-context"
import { businessCategories } from "@/lib/data"
import { MapPin, PhoneCall, Search, Star, X } from "lucide-react"

/* eslint-disable @typescript-eslint/no-explicit-any */

/** A real business picked from Google Places — drives the personalized demo + signup prefill. */
export type BusinessProfile = {
  name: string
  category: string
  address: string
  line1: string
  city: string
  postalCode: string
  phone: string
  website: string
  rating: number | null
  ratingsTotal: number | null
}

// Google place types → Gigahoo demo categories. Name keywords fill the gaps
// (Google has no legacy type for HVAC/appliance/garage-door businesses).
const TYPE_TO_CATEGORY: Record<string, string> = {
  plumber: "Plumbing",
  electrician: "Electrical",
  locksmith: "Locksmith",
  roofing_contractor: "Roofing",
}
const NAME_HINTS: Array<[RegExp, string]> = [
  [/hvac|heating|furnace|air condition|climate/i, "HVAC"],
  [/plumb/i, "Plumbing"],
  [/electric/i, "Electrical"],
  [/roof/i, "Roofing"],
  [/locksmith|lock & key|lock and key/i, "Locksmith"],
  [/garage door/i, "Garage Door Repair"],
  [/appliance/i, "Appliance Repair"],
  [/clean|maid|janitorial/i, "Cleaning"],
]

function guessCategory(types: string[] | undefined, name: string): string {
  for (const t of types ?? []) {
    const mapped = TYPE_TO_CATEGORY[t]
    if (mapped && businessCategories.includes(mapped)) return mapped
  }
  for (const [re, cat] of NAME_HINTS) {
    if (re.test(name) && businessCategories.includes(cat)) return cat
  }
  return "Other"
}

function pick(components: any[], type: string, which: "long_name" | "short_name" = "long_name"): string {
  const c = (components ?? []).find((comp: any) => comp.types?.includes(type))
  return c ? (c[which] ?? "") : ""
}

/**
 * "What's your business name?" — the AskBenny-style enrollment hook, one better:
 * pick your real business from Google Places, then TALK to your own AI
 * receptionist (it answers with your business name) before ever signing up.
 */
export function BusinessLookup({
  business,
  onSelect,
  onClear,
  onTalk,
}: {
  business: BusinessProfile | null
  onSelect: (b: BusinessProfile) => void
  onClear: () => void
  onTalk: () => void
}) {
  const { t } = useTranslation()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  useEffect(() => {
    if (!MAPS_KEY) return
    let cancelled = false
    let autocomplete: any = null
    let listener: any = null

    loadMaps().then(() => {
      if (cancelled || !inputRef.current || !window.google?.maps?.places) return
      autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["establishment"],
        fields: [
          "name",
          "types",
          "formatted_address",
          "address_components",
          "formatted_phone_number",
          "website",
          "rating",
          "user_ratings_total",
        ],
        componentRestrictions: { country: ["ca", "us", "mx"] },
      })
      listener = autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace()
        if (!place?.name) return
        const components = place.address_components ?? []
        const streetNumber = pick(components, "street_number")
        const route = pick(components, "route")
        onSelectRef.current({
          name: place.name,
          category: guessCategory(place.types, place.name),
          address: place.formatted_address ?? "",
          line1: `${streetNumber} ${route}`.trim(),
          city: pick(components, "locality") || pick(components, "postal_town") || "",
          postalCode: pick(components, "postal_code"),
          phone: place.formatted_phone_number ?? "",
          website: place.website ?? "",
          rating: typeof place.rating === "number" ? place.rating : null,
          ratingsTotal: typeof place.user_ratings_total === "number" ? place.user_ratings_total : null,
        })
        setQuery("")
      })
    })

    return () => {
      cancelled = true
      if (listener && window.google?.maps?.event) window.google.maps.event.removeListener(listener)
      if (autocomplete && window.google?.maps?.event) window.google.maps.event.clearInstanceListeners(autocomplete)
    }
  }, [])

  // Signup prefill rides sessionStorage — the signup flow reads + clears it on mount.
  const goSignup = () => {
    if (business) {
      try {
        sessionStorage.setItem("gigahoo-signup-prefill", JSON.stringify(business))
      } catch {
        // Storage unavailable — signup just starts empty.
      }
    }
    router.push("/signup")
  }

  if (!MAPS_KEY) return null

  if (business) {
    return (
      <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-white/95 p-4 text-left shadow-lg backdrop-blur-sm dark:bg-card/95">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="break-words text-base font-bold text-gray-900 dark:text-foreground">{business.name}</p>
            <p className="mt-0.5 flex items-start gap-1 text-xs text-gray-500 dark:text-muted-foreground">
              <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
              <span className="break-words">{business.address}</span>
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {business.rating != null && (
                <span className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-foreground">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {business.rating.toFixed(1)}
                  {business.ratingsTotal != null && (
                    <span className="text-gray-400 dark:text-muted-foreground">({business.ratingsTotal})</span>
                  )}
                </span>
              )}
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {business.category}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            aria-label={t("home.lookupClear")}
            title={t("home.lookupClear")}
            className="shrink-0 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-muted-foreground dark:hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1 gap-2" onClick={onTalk}>
            <PhoneCall className="h-4 w-4" />
            {t("home.lookupTalk")}
          </Button>
          <Button variant="outline" className="flex-1" onClick={goSignup}>
            {t("home.lookupSignup")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl">
      <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/95 p-2 shadow-lg backdrop-blur-sm dark:bg-card/95">
        <Search className="ml-2 h-5 w-5 shrink-0 text-gray-400 dark:text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("home.lookupPlaceholder")}
          spellCheck={false}
          className="h-10 min-w-0 flex-1 bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-400 dark:text-foreground dark:placeholder:text-muted-foreground"
        />
      </div>
      <p className="mt-2 text-sm text-white/75">{t("home.lookupHint")}</p>
    </div>
  )
}
