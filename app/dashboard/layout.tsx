import type { ReactNode } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-secondary/20">
      <DashboardSidebar />
      <div className="lg:pl-64">
        {/* Desktop top bar — language switch sits top-right, as on the main site. */}
        <header className="sticky top-0 z-30 hidden h-16 items-center justify-end border-b border-border bg-background/90 px-6 backdrop-blur-md lg:flex">
          <LanguageSwitcher />
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  )
}
