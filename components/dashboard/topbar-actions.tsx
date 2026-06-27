"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useTranslation } from "@/contexts/language-context"
import { useUnsavedGuard } from "@/components/dashboard/unsaved-guard"
import { Home, LogOut } from "lucide-react"

export function TopbarActions() {
  const { logout } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()
  const { guard, confirmDialog } = useUnsavedGuard()

  return (
    <div className="flex items-center gap-2">
      {confirmDialog}
      <Button
        variant="outline"
        className="cursor-pointer gap-2"
        onClick={() => guard(() => router.push("/"))}
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">{t("dashboard.homePage")}</span>
      </Button>
      <Button
        onClick={() => guard(() => logout())}
        className="cursor-pointer gap-2 bg-indigo-600 font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">{t("dashboard.signOut")}</span>
      </Button>
    </div>
  )
}
