"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/contexts/language-context"

const STORAGE_KEY = "gigahoo-theme"

/**
 * Day/night switch. The initial .dark class is applied before paint by the
 * inline script in the root layout (localStorage, falling back to the OS
 * preference); this button just flips and persists it.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useTranslation()
  // Read the real state after mount (SSR can't know the theme).
  const [dark, setDark] = useState(false)
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"))
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light")
    } catch {
      // Storage unavailable — the choice just won't persist.
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label={t("nav.toggleTheme")}
      title={t("nav.toggleTheme")}
      className={className}
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}
