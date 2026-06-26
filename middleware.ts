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

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // The host pins the market for regional domains: `.ca` -> Canada and
  // `.mx`/`.com.mx` -> Mexico. Other hosts (.ai/.com) fall back to geo.
  const host = (request.headers.get("host") ?? "").toLowerCase();
  const forcedCountry = host.endsWith(".ca")
    ? "CA"
    : host.endsWith(".mx")
      ? "MX"
      : null;

  // Hosting-provided country (Vercel / Cloudflare), when available.
  const geoCountry =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    undefined;

  const country = (forcedCountry ?? geoCountry)?.toUpperCase();

  // Country cookie: a regional domain always pins its market. Geo domains
  // (.ai/.com) reflect the visitor's CURRENT location on every visit — unless
  // they've explicitly picked a country (NEXT_COUNTRY_PICKED === "1").
  const countryPicked = request.cookies.get(COUNTRY_PICKED_COOKIE)?.value === "1";
  if (forcedCountry) {
    response.cookies.set(COUNTRY_COOKIE, forcedCountry, COOKIE_OPTIONS);
  } else if (geoCountry && !countryPicked) {
    response.cookies.set(COUNTRY_COOKIE, geoCountry.toUpperCase(), COOKIE_OPTIONS);
  }

  // Locale cookie: only set the host/geo default while the user has NOT
  // explicitly chosen a language. Once they pick, NEXT_LOCALE_PICKED === "1"
  // and we leave their NEXT_LOCALE untouched.
  const picked = request.cookies.get(LOCALE_PICKED_COOKIE)?.value;
  if (picked !== "1") {
    const locale = country
      ? localeForCountry(country)
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
