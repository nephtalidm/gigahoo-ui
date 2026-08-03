import type { Metadata } from "next"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { IndustryView } from "@/components/industry-view"
import { INDUSTRY_CATEGORIES, INDUSTRY_SLUGS } from "@/lib/industries"
import { LOCALE_COOKIE, defaultLocale, isLocale } from "@/lib/i18n/config"
import { dictionaries } from "@/lib/i18n/dictionaries"
import { businessCategoryKeys } from "@/lib/data"

// SEO landing pages per trade: /industries/plumbing, /industries/hvac, …
export function generateStaticParams() {
  return INDUSTRY_SLUGS.map((slug) => ({ slug }))
}

async function localizedName(slug: string): Promise<{ name: string; industries: Record<string, string> } | null> {
  const category = INDUSTRY_CATEGORIES[slug]
  if (!category) return null
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value
  const locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale
  const dict = dictionaries[locale] as unknown as {
    categories: Record<string, string>
    industries: Record<string, string>
  }
  const key = businessCategoryKeys[category] ?? "other"
  return { name: dict.categories[key] ?? category, industries: dict.industries }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const loc = await localizedName(slug)
  if (!loc) return {}
  return {
    title: loc.industries.metaTitle.replace("{name}", loc.name),
    description: loc.industries.metaDescription.replace("{name}", loc.name),
  }
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = INDUSTRY_CATEGORIES[slug]
  if (!category) notFound()
  return <IndustryView category={category} />
}
