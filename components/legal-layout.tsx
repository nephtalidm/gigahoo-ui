import type React from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export function LegalLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string
  lastUpdated: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <header className="border-b border-border pb-8">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{title}</h1>
            <p className="mt-3 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          </header>
          <div className="mt-8 flex flex-col gap-8">{children}</div>
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}

export function LegalSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold text-foreground">{heading}</h2>
      <div className="flex flex-col gap-3 leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}
