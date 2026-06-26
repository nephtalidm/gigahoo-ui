"use client"

import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useAuth } from "@/contexts/auth-context"
import { useTranslation } from "@/contexts/language-context"
import { LogOut } from "lucide-react"

export function TopbarActions() {
  const { logout } = useAuth()
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2">
      <LanguageSwitcher />
      <Button
        onClick={() => logout()}
        className="cursor-pointer gap-2 bg-indigo-600 font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">{t("dashboard.signOut")}</span>
      </Button>
    </div>
  )
}
