"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { getAccount, type AccountData } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useTranslation } from "@/contexts/language-context"
import {
  LayoutDashboard,
  PhoneCall,
  Sparkles,
  CreditCard,
  Settings,
  Menu,
  LogOut,
} from "lucide-react"

const navItems = [
  { labelKey: "dashboard.navOverview", href: "/dashboard", icon: LayoutDashboard },
  { labelKey: "dashboard.navCallHistory", href: "/dashboard/calls", icon: PhoneCall },
  { labelKey: "dashboard.navOptionalFeatures", href: "/dashboard/features", icon: Sparkles },
  { labelKey: "dashboard.navPlanBilling", href: "/dashboard/billing", icon: CreditCard },
  { labelKey: "dashboard.navSettings", href: "/dashboard/settings", icon: Settings },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
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
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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

function UserInfo({ onLogout }: { onLogout: () => void }) {
  const [account, setAccount] = useState<AccountData | null>(null)
  const { t } = useTranslation()

  useEffect(() => {
    getAccount()
      .then(setAccount)
      .catch(() => {})
  }, [])

  return (
    <div className="flex flex-col gap-2">
      <div className="min-w-0 px-2">
        <p className="truncate text-sm font-medium text-foreground">
          {account?.businessName ?? t("dashboard.loading")}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {account ? t("dashboard.planLabel", { plan: account.plan }) : ""}
        </p>
      </div>
      <Button
        variant="ghost"
        onClick={onLogout}
        className="relative w-full justify-center rounded-lg bg-indigo-600 font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 hover:text-white"
      >
        <LogOut className="absolute left-4 h-4 w-4" />
        {t("dashboard.signOut")}
      </Button>
    </div>
  )
}

export function DashboardSidebar() {
  const [open, setOpen] = useState(false)
  const { logout } = useAuth()
  const { t } = useTranslation()

  function handleLogout() {
    // logout() clears auth state and redirects, so just invoke it.
    logout()
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center border-b border-border px-6">
          <BrandLogo />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <NavLinks />
        </div>
        <div className="border-t border-border p-4">
          <UserInfo onLogout={handleLogout} />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md lg:hidden">
        <BrandLogo />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" aria-label={t("dashboard.openMenu")}>
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">{t("dashboard.navigation")}</SheetTitle>
            <div className="flex h-16 items-center border-b border-border px-6">
              <BrandLogo />
            </div>
            <div className="p-4">
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
            <div className="border-t border-border p-4">
              <UserInfo onLogout={handleLogout} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
