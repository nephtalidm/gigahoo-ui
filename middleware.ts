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
