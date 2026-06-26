import type { ReactNode } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { TopbarActions } from "@/components/dashboard/topbar-actions"
import { IdleTimeout } from "@/components/dashboard/idle-timeout"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-secondary/20">
      <IdleTimeout />
      <DashboardSidebar />
      <div className="lg:pl-64">
        {/* Desktop top bar — language switch sits top-right, as on the main site. */}
        <header className="sticky top-0 z-30 hidden h-16 items-center justify-end border-b border-border bg-background/90 px-6 backdrop-blur-md lg:flex">
          <TopbarActions />
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  )
}
