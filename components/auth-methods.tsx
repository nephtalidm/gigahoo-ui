"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleIcon } from "@/components/brand-logo"
import { useAuth } from "@/contexts/auth-context"
import { verifyMagicLink, api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Mail, MessageSquare, ArrowLeft, Loader2 } from "lucide-react"
import { z } from "zod"

type Mode = "menu" | "email" | "sms" | "password"

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address").max(254),
})

const phoneSchema = z.object({
  phone: z.string().min(7, "Please enter a valid phone number").max(20),
})

const codeSchema = z.object({
  code: z.string().min(4, "Code must be at least 4 digits").max(6),
})

export function AuthMethods({ onAuthenticated, initialMode }: { onAuthenticated?: () => void; initialMode?: "signin" | "signup" }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loginWithGoogle, sendMagicLink, sendSmsCode, verifySmsCode, storeAuth } = useAuth()
  const [mode, setMode] = useState<Mode>(initialMode === "signup" ? "email" : "menu")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPassword, setHasPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(initialMode === "signup")

  function finish() {
    if (onAuthenticated) onAuthenticated()
  }

  const backLabel = isSignUp ? "Back to sign up" : "All sign-in options"

  async function handleGoogle() {
    setLoading(true)
    setError(null)
    try {
      await loginWithGoogle("google-id-token-placeholder")
      finish()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed")
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyEmail(e: React.FormEvent) {
    e.preventDefault()
    const result = codeSchema.safeParse({ code })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await verifyMagicLink(email, code)
      storeAuth(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code")
    } finally {
      setLoading(false)
    }
  }

  async function handleSendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    const result = emailSchema.safeParse({ email })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const resp = await api.post<{ exists: boolean; hasPassword: boolean }>("/api/auth/check-email", { email })

      if (isSignUp) {
        // Sign up: email must NOT exist
        if (resp.exists) {
          setError("This email is already registered. Please sign in instead.")
          setLoading(false)
          return
        }
        await sendMagicLink(email)
        setEmailSent(true)
      } else {
        // Sign in: email must exist
        if (!resp.exists) {
          setError("No account found with this email. Please sign up instead.")
          setLoading(false)
          return
        }
        if (resp.hasPassword) {
          setHasPassword(true)
          setMode("password")
          setLoading(false)
          return
        }
        await sendMagicLink(email)
        setEmailSent(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check email")
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    const result = z.object({ password: z.string().min(1, "Password is required") }).safeParse({ password })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await api.post<{ accessToken: string; expiresAt: string; isNewUser: boolean }>(
        "/api/auth/login-password",
        { email, password }
      )
      storeAuth(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    const result = phoneSchema.safeParse({ phone })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }
    setLoading(true)
    setError(null)
    try {
      await sendSmsCode(phone)
      setCodeSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code")
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    const result = codeSchema.safeParse({ code })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }
    setLoading(true)
    setError(null)
    try {
      await verifySmsCode(phone, code)
      finish()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code")
    } finally {
      setLoading(false)
    }
  }

  if (mode === "menu") {
    return (
      <div className="flex flex-col gap-3">
        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <Button onClick={handleGoogle} disabled={loading} variant="outline" size="lg" className="w-full justify-center gap-3">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon className="h-5 w-5" />}
          Continue with Google
        </Button>
        <Button onClick={() => setMode("sms")} variant="outline" size="lg" className="w-full justify-center gap-3">
          <MessageSquare className="h-5 w-5" />
          Continue with SMS
        </Button>
        <Button onClick={() => setMode("email")} variant="outline" size="lg" className="w-full justify-center gap-3">
          <Mail className="h-5 w-5" />
          Continue with Email
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => {
          setMode("menu")
          setEmailSent(false)
          setCodeSent(false)
          setError(null)
        }}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
          {backLabel}
      </button>

      {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      {mode === "email" &&
        (emailSent ? (
          <form onSubmit={handleVerifyEmail} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email-code">Verification Code</Label>
              <div className="flex justify-center gap-2">
                <input
                  id="email-code"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && code.length === 0) {
                      setMode("menu")
                      setEmailSent(false)
                      setCode("")
                      setError(null)
                    }
                  }}
                  className="absolute -left-[9999px] -top-[9999px] w-0 h-0 opacity-0"
                  autoFocus
                />
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    onClick={() => document.getElementById("email-code")?.focus()}
                    className={cn(
                      "w-12 h-14 flex items-center justify-center text-2xl font-mono rounded-lg border cursor-text transition-colors",
                      code[i]
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-secondary/30 text-muted-foreground",
                    )}
                  >
                    {code[i] || "_"}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {"Sent to "}
                <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>
            <Button type="submit" size="lg" disabled={loading || code.length < 6} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify & Continue
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSendMagicLink} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="you@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>
          </form>
        ))}

      {mode === "password" && (
        <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => { setMode("menu"); setPassword(""); setHasPassword(false) }}
            className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
              {backLabel}
          </button>
          <div className="flex flex-col gap-2">
            <Label htmlFor="login-password">Password</Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Signing in as <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>
          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      )}

      {mode === "sms" &&
        (codeSent ? (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="code">6-Digit Code</Label>
              <Input
                id="code"
                inputMode="numeric"
                maxLength={6}
                required
                placeholder="••••••"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="text-center text-lg tracking-[0.5em]"
              />
              <p className="text-xs text-muted-foreground">
                {"Sent to "}
                <span className="font-medium text-foreground">{phone}</span>
              </p>
            </div>
            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify & Continue
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSendCode} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Business Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                required
                placeholder="(555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Verification Code
            </Button>
          </form>
        ))}
    </div>
  )
}
