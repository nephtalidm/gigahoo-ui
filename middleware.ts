import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  LOCALE_COOKIE,
  COUNTRY_COOKIE,
  LOCALE_PICKED_COOKIE,
  COUNTRY_PICKED_COOKIE,
  localeForAcceptLanguage,
  localeForCountry,
  defaultLocale,
} from "@/lib/i18n/config";

const COOKIE_OPTIONS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax",
} as const;

// Regional domains are data-driven: the API's /api/domains endpoint maps each
// host to an optional country code (null = geo-detect). A regional host like
// gigahoo.ca pins its market; geo hosts (.ai/.com) return null. Fetched here
// (cached 1h) instead of hardcoded so coverage is changed in the DB, not code.
async function forcedCountryForHost(host: string): Promise<string | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/domains`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const domains = (await res.json()) as { host: string; countryCode: string | null }[];
    const map = new Map<string, string | null>();
    for (const d of domains) {
      map.set(d.host.toLowerCase().replace(/^www\./, ""), d.countryCode ?? null);
    }
    const normalized = host.replace(/^www\./, "");
    return map.get(normalized)?.toUpperCase() ?? null;
  } catch {
    // On any error, fall back to NO forced country (geo) — never re-hardcode.
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const host = (request.headers.get("host") ?? "").toLowerCase();
  const forcedCountry = await forcedCountryForHost(host);

  // Hosting-provided country (Vercel / Cloudflare), when available.
  const geoCountry =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    undefined;

  // The default country: a regional domain pins its market; geo domains use the
  // visitor's current location. An explicit pick (NEXT_COUNTRY_PICKED === "1")
  // overrides the default on EVERY domain so the country switcher actually sticks.
  const countryPicked = request.cookies.get(COUNTRY_PICKED_COOKIE)?.value === "1";
  const existingCountry = request.cookies.get(COUNTRY_COOKIE)?.value?.toUpperCase();
  const defaultCountry = (forcedCountry ?? geoCountry)?.toUpperCase();
  const effectiveCountry = countryPicked ? (existingCountry ?? defaultCountry) : defaultCountry;

  if (!countryPicked && defaultCountry) {
    response.cookies.set(COUNTRY_COOKIE, defaultCountry, COOKIE_OPTIONS);
  }

  // Locale follows the effective country (so picking Mexico -> Spanish, US/CA ->
  // English), unless the user has explicitly chosen a language themselves.
  const localePicked = request.cookies.get(LOCALE_PICKED_COOKIE)?.value === "1";
  if (!localePicked) {
    const locale = effectiveCountry
      ? localeForCountry(effectiveCountry)
      : localeForAcceptLanguage(request.headers.get("accept-language")) ?? defaultLocale;

    response.cookies.set(LOCALE_COOKIE, locale, COOKIE_OPTIONS);
  }

  return response;
}

export const config = {
  // Run on all routes except Next internals and static assets, so the locale
  // cookie is established no matter where a visitor first lands.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)"],
};
