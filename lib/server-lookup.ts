import "server-only"
import type { CountryData, RegionData } from "@/lib/api"

// Server-side reads of the country/region lookup tables (from the DB via the API's
// anonymous lookup endpoints). Rendered into pages as props so the BROWSER never
// fetches them — the data still lives only in the DB. Cached for an hour so the
// server hits the API at most once per hour, not per page view.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.gigahoo.ai"

export async function getSupportedCountriesServer(): Promise<CountryData[]> {
  try {
    const r = await fetch(`${API_BASE}/api/lookup/countries?supportedOnly=true`, { next: { revalidate: 3600 } })
    return r.ok ? await r.json() : []
  } catch { return [] }
}

export async function getRegionsServer(countryId: number): Promise<RegionData[]> {
  try {
    const r = await fetch(`${API_BASE}/api/lookup/countries/${countryId}/regions`, { next: { revalidate: 3600 } })
    return r.ok ? await r.json() : []
  } catch { return [] }
}

// All supported countries + their regions, keyed by country id — everything the
// signup dropdowns need, fetched once on the server.
export async function getSignupGeoData(): Promise<{ countries: CountryData[]; regionsByCountryId: Record<number, RegionData[]> }> {
  const countries = await getSupportedCountriesServer()
  const entries = await Promise.all(countries.map(async (c) => [c.id, await getRegionsServer(c.id)] as const))
  return { countries, regionsByCountryId: Object.fromEntries(entries) }
}
