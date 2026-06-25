import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  LOCALE_COOKIE,
  COUNTRY_COOKIE,
  isLocale,
  localeForAcceptLanguage,
  localeForCountry,
  defaultLocale,
} from "@/lib/i18n/config";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Hosting-provided country (Vercel / Cloudflare), when available.
  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    undefined;

  // Only set the default locale once; after that the user's explicit choice
  // (set by the language switcher) wins and we must not override it.
  const existing = request.cookies.get(LOCALE_COOKIE)?.value;
  if (!isLocale(existing)) {
    const locale = country
      ? localeForCountry(country)
      : localeForAcceptLanguage(request.headers.get("accept-language")) ?? defaultLocale;

    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  // Record the detected country so the client can default phone country codes
  // (e.g. +1 for US/CA, +52 for MX).
  if (country && !request.cookies.get(COUNTRY_COOKIE)) {
    response.cookies.set(COUNTRY_COOKIE, country.toUpperCase(), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  // Run on all routes except Next internals and static assets, so the locale
  // cookie is established no matter where a visitor first lands.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)"],
};
