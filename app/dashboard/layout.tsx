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
        {/* Desktop top bar — sign-out, right-aligned to the same width as the page content. */}
        <header className="sticky top-0 z-30 hidden h-16 items-center border-b border-border bg-background/90 backdrop-blur-md lg:flex">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-end px-6">
            <TopbarActions />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  )
}
