"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    google?: any
  }
}

const GSI_SRC = "https://accounts.google.com/gsi/client"

// The visitor's market (ISO-2) from the NEXT_COUNTRY cookie — used to gate new-account
// signups from non-supported regions, same as the login flow.
function selectedCountry() {
  return (document.cookie.match(/(?:^|;\s*)NEXT_COUNTRY=([^;]+)/)?.[1] ?? "").toUpperCase()
}

/**
 * Google One Tap for marketing pages (e.g. the home page): auto-shows the account prompt
 * to LOGGED-OUT visitors who already have a Google session, and signs them in on accept.
 * Renders no visible UI — One Tap floats its own card. No prompt for authenticated users.
 */
export function GoogleOneTap() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const { isAuthenticated, isLoading, loginWithGoogle } = useAuth()

  const loginRef = useRef(loginWithGoogle)
  useEffect(() => { loginRef.current = loginWithGoogle }, [loginWithGoogle])
  const prompted = useRef(false)

  useEffect(() => {
    // Logged-out visitors only, and only after the auth check has settled. Prompt once.
    if (!clientId || isLoading || isAuthenticated || prompted.current) return
    prompted.current = true
    let cancelled = false

    function init() {
      if (cancelled || !window.google?.accounts?.id) return
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (resp: { credential?: string }) => {
          if (resp?.credential) loginRef.current(resp.credential, selectedCountry()).catch(() => {})
        },
        use_fedcm_for_prompt: true,
      })
      try { window.google.accounts.id.prompt() } catch { /* prompt unavailable */ }
    }

    if (window.google?.accounts?.id) {
      init()
      return
    }
    let script = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`)
    if (!script) {
      script = document.createElement("script")
      script.src = GSI_SRC
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
    script.addEventListener("load", init)
    return () => {
      cancelled = true
      script?.removeEventListener("load", init)
    }
  }, [clientId, isAuthenticated, isLoading])

  if (!clientId) return null
  return (
    <>
      <link rel="preconnect" href="https://accounts.google.com" />
      <link rel="preload" as="script" href={GSI_SRC} />
    </>
  )
}
