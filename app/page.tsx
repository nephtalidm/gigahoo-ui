import { cookies } from "next/headers"
import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"
import { Pricing } from "@/components/pricing"
import { Faq } from "@/components/faq"
import { FinalCta } from "@/components/final-cta"
import { SiteFooter } from "@/components/site-footer"
import type { PublicPrices } from "@/lib/api"

// Sensible USD defaults so the page never breaks if the price fetch fails.
const DEFAULT_CURRENCY = "USD"
const DEFAULT_PRICES: Record<string, string> = { Free: "$0", Starter: "$49", Business: "$99" }

// Fetch per-currency prices server-side (no CORS — server-to-server, absolute
// base URL) so the pricing section renders the visitor's currency on first paint
// with no client-fetch flicker.
async function fetchPrices(country: string): Promise<{ currency: string; prices: Record<string, string> }> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    const res = await fetch(`${base}/api/billing/public-prices?code=${encodeURIComponent(country)}`, {
      cache: "no-store",
    })
    if (!res.ok) throw new Error(`Request failed (${res.status})`)
    const data = (await res.json()) as PublicPrices
    const prices: Record<string, string> = {}
    for (const p of data.plans) {
      prices[p.slug] = `$${Math.round(p.amount)}`
    }
    return { currency: data.currency || DEFAULT_CURRENCY, prices }
  } catch {
    return { currency: DEFAULT_CURRENCY, prices: DEFAULT_PRICES }
  }
}

export default async function Page() {
  const cookieStore = await cookies()
  const country = (cookieStore.get("NEXT_COUNTRY")?.value ?? "").toUpperCase()
  const { currency, prices } = await fetchPrices(country)

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing currency={currency} prices={prices} country={country} />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  )
}
