"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type UnsavedChangesContextValue = {
  dirty: boolean
  setDirty: (v: boolean) => void
}

const UnsavedChangesContext = createContext<UnsavedChangesContextValue | null>(null)

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const [dirty, setDirty] = useState(false)

  // While there are unsaved edits, leaving/refreshing/closing the tab triggers
  // the browser's native confirm dialog.
  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      // Legacy requirement for the native prompt to show in some browsers.
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [dirty])

  return (
    <UnsavedChangesContext.Provider value={{ dirty, setDirty }}>
      {children}
    </UnsavedChangesContext.Provider>
  )
}

export function useUnsavedChanges() {
  const ctx = useContext(UnsavedChangesContext)
  if (!ctx) {
    throw new Error("useUnsavedChanges must be used within an UnsavedChangesProvider")
  }
  return ctx
}
