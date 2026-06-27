"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { getAccount, type AccountData } from "@/lib/api"
import { useTranslation } from "@/contexts/language-context"
import { isLocale, LOCALE_COOKIE, LOCALE_PICKED_COOKIE } from "@/lib/i18n/config"
import { useAuth } from "@/contexts/auth-context"
import { useUnsavedGuard } from "@/components/dashboard/unsaved-guard"
import {
  LayoutDashboard,
  PhoneCall,
  CreditCard,
  Wallet,
  Bell,
  AudioLines,
  Settings,
  Menu,
  LogOut,
} from "lucide-react"

const navItems = [
  { labelKey: "dashboard.navOverview", href: "/dashboard", icon: LayoutDashboard },
  { labelKey: "dashboard.navSettings", href: "/dashboard/settings", icon: Settings },
  { labelKey: "dashboard.navVoiceAgent", href: "/dashboard/voice", icon: AudioLines },
  { labelKey: "dashboard.navCallHistory", href: "/dashboard/calls", icon: PhoneCall },
  { labelKey: "dashboard.navNotifications", href: "/dashboard/notifications", icon: Bell },
  { labelKey: "dashboard.navPlanBilling", href: "/dashboard/billing", icon: CreditCard },
  { labelKey: "dashboard.navBilling", href: "/dashboard/billing-methods", icon: Wallet },
]

function NavLinks({
  onNavigate,
  onGuardedNavigate,
}: {
  onNavigate?: () => void
  // When provided, navigation is routed through the unsaved-changes guard
  // instead of letting the <Link> navigate directly.
  onGuardedNavigate?: (href: string) => void
}) {
  const pathname = usePathname()
  const { t } = useTranslation()
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => {
              // Don't intercept navigation to the page we're already on.
              if (onGuardedNavigate && item.href !== pathname) {
                e.preventDefault()
                onGuardedNavigate(item.href)
              }
              onNavigate?.()
            }}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {t(item.labelKey)}
          </Link>
        )
      })}
    </nav>
  )
}

function UserInfo() {
  const [account, setAccount] = useState<AccountData | null>(null)
  const { t, setLocale } = useTranslation()
  // Apply the account's default language at most once per mount, so the effect
  // below can never loop (setLocale re-renders this component).
  const appliedDefaultLanguage = useRef(false)

  useEffect(() => {
    getAccount()
      .then((acc) => {
        setAccount(acc)
        // Default the dashboard to the user's stored AccountLanguage — but only
        // when they haven't explicitly picked a language this session
        // (NEXT_LOCALE_PICKED !== "1"), it differs from the current NEXT_LOCALE
        // cookie, and we haven't already applied it. The ref guard guarantees
        // this runs once and can't reload-loop.
        if (appliedDefaultLanguage.current) return
        const cookies = typeof document !== "undefined" ? document.cookie : ""
        const picked = cookies.match(/(?:^|;\s*)NEXT_LOCALE_PICKED=([^;]+)/)?.[1]
        const current = cookies.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`))?.[1]
        const lang = acc.accountLanguage
        if (picked !== "1" && isLocale(lang) && lang !== current) {
          appliedDefaultLanguage.current = true
          // setLocale writes the NEXT_LOCALE cookie and re-renders (no reload).
          setLocale(lang)
          // setLocale also marks NEXT_LOCALE_PICKED=1; undo that so this remains
          // an automatic default (not an explicit user choice), keeping future
          // auto-defaults in play if AccountLanguage later changes.
          document.cookie = `${LOCALE_PICKED_COOKIE}=;path=/;max-age=0;samesite=lax`
        } else {
          appliedDefaultLanguage.current = true
        }
      })
      .catch(() => {})
  }, [setLocale])

  return (
    <div className="flex min-w-0 items-center gap-2.5 px-2">
      {account?.countryCode && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://flagcdn.com/${account.countryCode.toLowerCase()}.svg`}
          alt=""
          width={24}
          height={18}
          className="h-[18px] w-[24px] shrink-0 rounded-[2px] object-cover shadow-sm ring-1 ring-black/5"
        />
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {account?.businessName ?? t("dashboard.loading")}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {account ? t("dashboard.planLabel", { plan: account.plan }) : ""}
        </p>
      </div>
    </div>
  )
}

export function DashboardSidebar() {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const { logout } = useAuth()
  const router = useRouter()
  const { guard, confirmDialog } = useUnsavedGuard()

  // Route an in-app navigation through the unsaved-changes guard.
  const guardedNavigate = (href: string) => guard(() => router.push(href))

  return (
    <>
      {confirmDialog}
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center border-b border-border px-6">
          <BrandLogo />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <NavLinks onGuardedNavigate={guardedNavigate} />
        </div>
        <div className="border-t border-border p-4">
          <UserInfo />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md lg:hidden">
        <BrandLogo />
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" aria-label={t("dashboard.openMenu")} className="h-11 w-11">
                <Menu className="h-7 w-7" />
              </Button>
            }
          />
          <SheetContent side="right" className="w-72 gap-0 p-0">
            <SheetTitle className="sr-only">{t("dashboard.navigation")}</SheetTitle>
            <div className="flex h-16 items-center px-4">
              <BrandLogo />
            </div>
            <div className="border-t border-border px-4 py-4">
              <NavLinks onNavigate={() => setOpen(false)} onGuardedNavigate={guardedNavigate} />
            </div>
            <div className="flex flex-col gap-4 border-t border-border p-4">
              <UserInfo />
              <Button className="h-11" onClick={() => { setOpen(false); guard(() => logout()) }}>
                <LogOut className="h-4 w-4" />
                {t("dashboard.signOut")}
              </Button>
            </div>
          </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}
