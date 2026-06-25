"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslation } from "@/contexts/language-context"
import { Menu, X } from "lucide-react"

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const navLinks = [
    { label: t("nav.features"), href: "/#features" },
    { label: t("nav.pricing"), href: "/#pricing" },
    { label: t("nav.faq"), href: "/#faq" },
    { label: t("nav.contact"), href: "/contact" },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/gigahoo-logo.png" alt="Gigahoo" className="h-[3.0rem] w-auto" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <Button variant="ghost" size="default" render={<Link href="/login">{t("nav.signIn")}</Link>} />
          <Button size="default" render={<Link href="/login?mode=signup">{t("nav.signUp")}</Link>} />
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <Button
                variant="outline"
                render={
                  <Link href="/login" onClick={() => setOpen(false)}>
                    {t("nav.signIn")}
                  </Link>
                }
              />
              <Button
                render={
                  <Link href="/login?mode=signup" onClick={() => setOpen(false)}>
                    {t("nav.signUp")}
                  </Link>
                }
              />
              <div className="pt-2">
                <LanguageSwitcher />
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
