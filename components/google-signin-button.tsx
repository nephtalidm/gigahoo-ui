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
 * Google Identity Services "Sign in with Google" button. Obtains a real ID
 * token and hands it to `onCredential`. Renders nothing when
 * NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured, so there's no broken button.
 */
export function GoogleSignInButton({
  onCredential,
  text = "continue_with",
}: {
  onCredential: (idToken: string) => void
  text?: "signin_with" | "signup_with" | "continue_with" | "signin"
}) {
  const ref = useRef<HTMLDivElement>(null)
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  // Keep the latest callback in a ref so the init effect does NOT re-run (and
  // re-render the Google button, which caused a flicker) just because the parent
  // passes a new onCredential function reference on each render.
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
  }, [clientId, text])

  if (!clientId) return null
  return <div ref={ref} className="flex min-h-10 justify-center" />
}
