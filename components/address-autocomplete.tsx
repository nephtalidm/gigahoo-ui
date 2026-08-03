"use client"

import { useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"

/* eslint-disable @typescript-eslint/no-explicit-any */
// Minimal type shim so tsc passes without @types/google.maps. The Google Maps
// JS API is loaded at runtime via a script tag, so `window.google` is typed as
// `any` here rather than pulling in the full type package.
declare global {
  interface Window {
    google?: any
  }
}

/** Address parsed from a Google Places `address_components` array. */
export type ParsedAddress = {
  line1: string
  city: string
  region: string
  regionShort: string
  postalCode: string
  countryCode: string
}

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

// Module-level singleton so the Maps JS script is injected at most once across
// every AddressAutocomplete instance (and across re-mounts).
let mapsPromise: Promise<void> | null = null

function loadMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  // Already available (e.g. another instance finished loading).
  if (window.google?.maps?.places) return Promise.resolve()
  if (mapsPromise) return mapsPromise

  mapsPromise = new Promise<void>((resolve) => {
    // Resolve once the Places library is actually queryable.
    const waitForReady = () => {
      if (window.google?.maps?.places) {
        resolve()
        return
      }
      const started = Date.now()
      const poll = window.setInterval(() => {
        if (window.google?.maps?.places || Date.now() - started > 10000) {
          window.clearInterval(poll)
          resolve()
        }
      }, 100)
    }

    // Reuse an existing script tag if one was already injected elsewhere.
    const existing = document.getElementById("google-maps-js") as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener("load", waitForReady, { once: true })
      // If it already loaded, the load event won't fire again — poll anyway.
      waitForReady()
      return
    }

    const script = document.createElement("script")
    script.id = "google-maps-js"
    script.async = true
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places&loading=async`
    script.addEventListener("load", waitForReady, { once: true })
    script.addEventListener("error", () => resolve(), { once: true })
    document.head.appendChild(script)
  })

  return mapsPromise
}

/** Read a long/short name out of a Google `address_components` array. */
function pick(
  components: any[],
  type: string,
  which: "long_name" | "short_name" = "long_name",
): string {
  const c = components.find((comp) => comp.types?.includes(type))
  return c ? (c[which] ?? "") : ""
}

function parseAddress(components: any[]): ParsedAddress {
  const streetNumber = pick(components, "street_number")
  const route = pick(components, "route")
  const line1 = `${streetNumber} ${route}`.trim()
  const city =
    pick(components, "locality") ||
    pick(components, "postal_town") ||
    pick(components, "sublocality_level_1") ||
    pick(components, "administrative_area_level_2") ||
    ""
  return {
    line1,
    city,
    region: pick(components, "administrative_area_level_1", "long_name"),
    regionShort: pick(components, "administrative_area_level_1", "short_name"),
    postalCode: pick(components, "postal_code"),
    countryCode: pick(components, "country", "short_name").toUpperCase(),
  }
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  id,
  placeholder,
  className,
  invalid,
  describedBy,
}: {
  value: string
  onChange: (v: string) => void
  onSelect: (a: ParsedAddress) => void
  id?: string
  placeholder?: string
  className?: string
  invalid?: boolean
  describedBy?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  // Keep the latest onSelect/onChange without re-running the effect that wires
  // up the Autocomplete (it should only attach once per input element).
  const onSelectRef = useRef(onSelect)
  const onChangeRef = useRef(onChange)
  onSelectRef.current = onSelect
  onChangeRef.current = onChange

  useEffect(() => {
    // No key configured → render a plain Input with no autocomplete behavior.
    if (!MAPS_KEY) return
    let cancelled = false
    let autocomplete: any = null
    let listener: any = null

    loadMaps().then(() => {
      if (cancelled || !inputRef.current || !window.google?.maps?.places) return
      autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        fields: ["address_components"],
        componentRestrictions: { country: ["ca", "us", "mx"] },
      })
      listener = autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace()
        const components = place?.address_components
        if (!components) return
        const parsed = parseAddress(components)
        onChangeRef.current(parsed.line1)
        onSelectRef.current(parsed)
      })
    })

    return () => {
      cancelled = true
      if (listener && window.google?.maps?.event) {
        window.google.maps.event.removeListener(listener)
      }
      if (autocomplete && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocomplete)
      }
    }
  }, [])

  return (
    <Input
      spellCheck={false}
      ref={inputRef}
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={invalid}
      aria-describedby={describedBy}
      className={className}
      placeholder={placeholder}
    />
  )
}
