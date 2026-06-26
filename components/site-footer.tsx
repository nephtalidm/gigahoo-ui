"use client"

import Link from "next/link"
import { useTranslation } from "@/contexts/language-context"

export function SiteFooter() {
  const { t } = useTranslation()

  const links = [
    { label: t("footer.features"), href: "/#features" },
    { label: t("footer.pricing"), href: "/#pricing" },
    { label: t("footer.faq"), href: "/#faq" },
    { label: t("footer.contact"), href: "/contact" },
    { label: t("footer.privacy"), href: "/privacy" },
    { label: t("footer.terms"), href: "/terms" },
  ]

  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-6xl px-4 pt-0 pb-12 sm:px-6">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/gigahoo-logo.png" alt="Gigahoo" className="h-[2.4rem] w-auto" />
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Gigahoo. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  )
}
