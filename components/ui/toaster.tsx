"use client"

import { useEffect, useState, useCallback, createContext, useContext } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type Toast = {
  id: string
  title: string
  description?: string
  variant?: "default" | "destructive"
}

type ToastContextType = {
  toast: (t: Omit<Toast, "id">) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

let globalToast: ((t: Omit<Toast, "id">) => void) | null = null

export function useToast() {
  const ctx = useContext(ToastContext)
  if (ctx) return ctx
  return {
    toast: (t: Omit<Toast, "id">) => globalToast?.(t),
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { ...t, id }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id))
    }, 5000)
  }, [])

  useEffect(() => {
    globalToast = toast
    return () => { globalToast = null }
  }, [toast])

  const dismiss = (id: string) => setToasts((prev) => prev.filter((x) => x.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-z-50 bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-bottom-5 fade-in",
              t.variant === "destructive"
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-border bg-card text-foreground"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{t.title}</p>
                {t.description && (
                  <p className="mt-1 text-xs opacity-80">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 rounded-md p-0.5 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
