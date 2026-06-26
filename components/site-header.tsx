"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { BrandLogo } from "@/components/brand-logo"
import { LanguageSwitcher } from "@/components/language-switcher"
import { CountrySwitcher } from "@/components/country-switcher"
import { useTranslation } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { LayoutDashboard, LogOut, Menu } from "lucide-react"

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const { isAuthenticated, logout } = useAuth()

  const navLinks = [
    { label: t("nav.features"), href: "/#features" },
    { label: t("nav.pricing"), href: "/#pricing" },
    { label: t("nav.faq"), href: "/#faq" },
    { label: t("nav.contact"), href: "/contact" },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <BrandLogo />

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
          <CountrySwitcher />
          <LanguageSwitcher />
          {isAuthenticated ? (
            <>
              <Button
                variant="outline"
                render={
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-5 w-5" />
                    {t("nav.dashboard")}
                  </Link>
                }
              />
              <Button size="default" onClick={() => logout()}>
                <LogOut className="h-4 w-4" />
                {t("nav.signOut")}
              </Button>
            </>
          ) : (
            <Button size="default" render={<Link href="/login">{t("nav.signIn")}</Link>} />
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                aria-label={t("nav.openMenu")}
                className="h-11 w-11 md:hidden"
              >
                <Menu className="h-7 w-7" />
              </Button>
            }
          />
          <SheetContent side="right" className="w-72 gap-0 p-0">
            <SheetTitle className="sr-only">{t("nav.openMenu")}</SheetTitle>
            <div className="flex h-14 items-center px-4">
              <BrandLogo />
            </div>
            <nav className="flex flex-col gap-1 border-t border-border p-4">
              <div className="flex flex-col gap-2 pb-2">
                <CountrySwitcher className="w-full" />
                <LanguageSwitcher className="w-full" />
              </div>
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
              <div className="my-2 border-t border-border" />
              <div className="flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Button
                      variant="outline"
                      render={
                        <Link href="/dashboard" onClick={() => setOpen(false)}>
                          <LayoutDashboard className="h-4 w-4" />
                          {t("nav.dashboard")}
                        </Link>
                      }
                    />
                    <Button onClick={() => { setOpen(false); logout() }}>
                      <LogOut className="h-4 w-4" />
                      {t("nav.signOut")}
                    </Button>
                  </>
                ) : (
                  <Button
                    render={
                      <Link href="/login" onClick={() => setOpen(false)}>
                        {t("nav.signIn")}
                      </Link>
                    }
                  />
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
