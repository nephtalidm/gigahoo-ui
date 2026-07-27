"use client"

import { useEffect, useRef } from "react"

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    google?: any
  }
}

const GSI_SRC = "https://accounts.google.com/gsi/client"

/**
 * Google Identity Services sign-in: the NATIVE "Sign in with Google" button (Google's
 * own rendered button) PLUS Google One Tap, which auto-shows the signed-in account
 * prompt on load (login only). Both return a real ID token to `onCredential`. Renders
 * nothing when NEXT_PUBLIC_GOOGLE_CLIENT_ID is unset.
 */
export function GoogleSignInButton({
  onCredential,
  oneTap = false,
  text = "continue_with",
}: {
  onCredential: (idToken: string) => void
  // Auto-show the One Tap account prompt on load (login only; not on the settings
  // link-account button, where an auto-prompt would be intrusive).
  oneTap?: boolean
  text?: "signin_with" | "signup_with" | "continue_with" | "signin"
}) {
  const ref = useRef<HTMLDivElement>(null)
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  // Keep the latest callback in a ref so the init effect doesn't re-run (and re-render
  // the Google button, causing a flicker) on every parent render.
  const onCredentialRef = useRef(onCredential)
  useEffect(() => {
    onCredentialRef.current = onCredential
  }, [onCredential])

  useEffect(() => {
    if (!clientId) return
    let cancelled = false

    function render() {
      if (cancelled || !window.google?.accounts?.id || !ref.current) return
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (resp: { credential?: string }) => {
          if (resp?.credential) onCredentialRef.current(resp.credential)
        },
        use_fedcm_for_prompt: true,
      })
      ref.current.innerHTML = ""
      window.google.accounts.id.renderButton(ref.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text,
        shape: "rectangular",
        logo_alignment: "center",
        width: Math.min(ref.current.clientWidth || 320, 400),
      })
      // One Tap: auto-show the account prompt on load (login only).
      if (oneTap) { try { window.google.accounts.id.prompt() } catch { /* prompt unavailable */ } }
    }

    if (window.google?.accounts?.id) {
      render()
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
    script.addEventListener("load", render)
    return () => {
      cancelled = true
      script?.removeEventListener("load", render)
    }
  }, [clientId, text, oneTap])

  if (!clientId) return null
  return (
    <>
      {/* Warm the connection + fetch the GSI script early (React hoists these to <head>). */}
      <link rel="preconnect" href="https://accounts.google.com" />
      <link rel="preload" as="script" href={GSI_SRC} />
      <div ref={ref} className="flex min-h-10 justify-center" />
    </>
  )
}
