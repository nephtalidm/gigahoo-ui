"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleSignInButton } from "@/components/google-signin-button"
import { CodeBoxes } from "@/components/code-boxes"
import { PhoneInput } from "@/components/phone-input"
import { useAuth } from "@/contexts/auth-context"
import { useTranslation } from "@/contexts/language-context"
import { useSupportedCountries } from "@/hooks/use-supported-countries"
import { verifyMagicLink, api, ApiError } from "@/lib/api"
import { toE164 } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Mail, MessageSquare, ArrowLeft, Loader2 } from "lucide-react"
import { z } from "zod"

type Mode = "menu" | "email" | "sms" | "password"

const emailSchema = z.object({
  email: z.string().email().max(254),
})

const phoneSchema = z.object({
  phone: z.string().min(7).max(20),
})

const codeSchema = z.object({
  code: z.string().length(6),
})

// The visitor's selected market (ISO-2), used to gate new-account signups from
// non-supported / coming-soon regions. Read from the NEXT_COUNTRY cookie.
function selectedCountry() {
  return (document.cookie.match(/(?:^|;\s*)NEXT_COUNTRY=([^;]+)/)?.[1] ?? "").toUpperCase()
}

// True when the error is the backend's 403 region-signup gate.
function isRegionRestricted(err: unknown) {
  return err instanceof ApiError && err.status === 403 && err.code === "region_signup_restricted"
}

export function AuthMethods({ onAuthenticated }: { onAuthenticated?: () => void }) {
  const { t } = useTranslation()
  const { loginWithGoogle, sendMagicLink, sendSmsCode, verifySmsCode, storeAuth } = useAuth()
  const [mode, setMode] = useState<Mode>("menu")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  // Supported (served) countries come from the API (Country.IsSupported), with a
  // settings.ts fallback while loading.
  const supportedCodes = useSupportedCountries()
  const [phoneCountryPicked, setPhoneCountryPicked] = useState<string | null>(null)
  // Default to the first supported country (Canada) unless the user picks another.
  const phoneCountry = phoneCountryPicked ?? supportedCodes[0]
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPassword, setHasPassword] = useState(false)
  const [resending, setResending] = useState(false)
  const [resentNotice, setResentNotice] = useState(false)
  const lastAutoCode = useRef("")

  // Resend cooldown: after a code is sent the resend stays locked for 60s (matching
  // the server's 1/min limit), counting down so the button shows when it's available.
  const [resendIn, setResendIn] = useState(0)
  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startResendCountdown = (seconds = 60) => {
    setResendIn(seconds)
    if (resendTimerRef.current) clearInterval(resendTimerRef.current)
    resendTimerRef.current = setInterval(() => {
      setResendIn((s) => {
        if (s <= 1) {
          if (resendTimerRef.current) clearInterval(resendTimerRef.current)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }
  useEffect(() => () => { if (resendTimerRef.current) clearInterval(resendTimerRef.current) }, [])

  // Live email-format validation for the email step. Only flags non-empty input
  // that isn't a valid address; empty clears the error.
  const emailInvalid = email.length > 0 && !emailSchema.safeParse({ email }).success

  // Live phone-format validation for the SMS step: flag non-empty input that
  // isn't a valid 10-digit US/CA number; empty clears the error.
  const phoneDigits = phone.replace(/\D/g, "")
  const phoneInvalid = phone.length > 0 && (/[a-zA-Z]/.test(phone) || phoneDigits.length !== 10)

  // The password-login field is flagged red whenever the password step has an
  // error (a failed login attempt or a required-empty submit). Typing into the
  // field clears the error, which clears the red border.
  const passwordInvalid = mode === "password" && !!error

  async function handleResend() {
    setResending(true)
    setError(null)
    setResentNotice(false)
    try {
      if (mode === "sms") {
        await sendSmsCode(toE164(phoneCountry, phone), selectedCountry())
      } else {
        await sendMagicLink(email, selectedCountry())
      }
      setCode("")
      lastAutoCode.current = ""
      setResentNotice(true)
      startResendCountdown()
    } catch (err) {
      if (isRegionRestricted(err)) {
        setError(t("auth.regionRestricted"))
        return
      }
      setError(err instanceof Error ? err.message : t("auth.failedToSendCode"))
    } finally {
      setResending(false)
    }
  }

  function finish() {
    if (onAuthenticated) onAuthenticated()
  }

  const backLabel = t("auth.allSignInOptions")

  async function handleGoogle(idToken: string) {
    setLoading(true)
    setError(null)
    try {
      await loginWithGoogle(idToken)
      finish()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.googleSignInFailed"))
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyEmail(e?: React.FormEvent) {
    e?.preventDefault()
    const result = codeSchema.safeParse({ code })
    if (!result.success) {
      setError(t("auth.codeMinLength"))
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await verifyMagicLink(email, code)
      storeAuth(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.invalidOrExpiredCode"))
    } finally {
      setLoading(false)
    }
  }

  async function handleSendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    const result = emailSchema.safeParse({ email })
    if (!result.success) {
      setError(t("auth.invalidEmail"))
      return
    }
    setLoading(true)
    setError(null)
    try {
      const resp = await api.post<{ exists: boolean; hasPassword: boolean }>("/api/auth/check-email", { email })

      // Unified create-or-login: returning users with a password sign in with it;
      // everyone else (new users and passwordless accounts) gets a magic link.
      if (resp.exists && resp.hasPassword) {
        setHasPassword(true)
        setMode("password")
        setLoading(false)
        return
      }
      await sendMagicLink(email, selectedCountry())
      setEmailSent(true)
      startResendCountdown()
    } catch (err) {
      if (isRegionRestricted(err)) {
        setError(t("auth.regionRestricted"))
        return
      }
      setError(err instanceof Error ? err.message : t("auth.failedToCheckEmail"))
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    const result = z.object({ password: z.string().min(1) }).safeParse({ password })
    if (!result.success) {
      setError(t("auth.passwordRequired"))
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
      setError(err instanceof Error ? err.message : t("auth.invalidEmailOrPassword"))
    } finally {
      setLoading(false)
    }
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    const result = phoneSchema.safeParse({ phone })
    if (!result.success) {
      setError(t("auth.invalidPhone"))
      return
    }
    setLoading(true)
    setError(null)
    try {
      await sendSmsCode(toE164(phoneCountry, phone), selectedCountry())
      setCodeSent(true)
      startResendCountdown()
    } catch (err) {
      if (isRegionRestricted(err)) {
        setError(t("auth.regionRestricted"))
        return
      }
      setError(err instanceof Error ? err.message : t("auth.failedToSendCode"))
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e?: React.FormEvent) {
    e?.preventDefault()
    const result = codeSchema.safeParse({ code })
    if (!result.success) {
      setError(t("auth.codeMinLength"))
      return
    }
    setLoading(true)
    setError(null)
    try {
      await verifySmsCode(toE164(phoneCountry, phone), code)
      finish()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.invalidOrExpiredCode"))
    } finally {
      setLoading(false)
    }
  }

  // Auto-submit the verification code as soon as it's complete (6 digits), for
  // both email and SMS. The "Verify" button stays as a manual fallback. The ref
  // guards against re-submitting the same code (e.g. after a wrong-code error);
  // editing the code (dropping below 6 digits) re-arms it.
  useEffect(() => {
    if (code.length < 6) {
      lastAutoCode.current = ""
      return
    }
    if (loading || code === lastAutoCode.current) return
    if (mode === "email" && emailSent) {
      lastAutoCode.current = code
      handleVerifyEmail()
    } else if (mode === "sms" && codeSent) {
      lastAutoCode.current = code
      handleVerify()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, loading, mode, emailSent, codeSent])

  if (mode === "menu") {
    // Google sign-in is verifying (handleGoogle in flight) — show a spinner right
    // away so the screen doesn't look frozen during the token exchange + redirect.
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )
    }
    return (
      <div className="flex flex-col gap-3">
        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <GoogleSignInButton onCredential={handleGoogle} text="continue_with" />
        <Button onClick={() => setMode("sms")} variant="outline" size="lg" className="w-full justify-center gap-3">
          <MessageSquare className="h-5 w-5" />
          {t("auth.continueWithSms")}
        </Button>
        <Button onClick={() => setMode("email")} variant="outline" size="lg" className="w-full justify-center gap-3">
          <Mail className="h-5 w-5" />
          {t("auth.continueWithEmail")}
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
          setPassword("")
          setHasPassword(false)
          setError(null)
          setResentNotice(false)
        }}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
          {backLabel}
      </button>

      {error && !passwordInvalid && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      {mode === "email" &&
        (emailSent ? (
          <form onSubmit={handleVerifyEmail} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email-code">{t("auth.verificationCode")}</Label>
              <CodeBoxes
                id="email-code"
                value={code}
                onChange={setCode}
                onEscape={() => { setMode("menu"); setEmailSent(false); setCode(""); setError(null) }}
              />
              <p className="text-xs text-muted-foreground text-center">
                {t("auth.sentTo")}
                <span className="font-medium text-foreground">{email}</span>
              </p>
              <ResendCode onResend={handleResend} resending={resending} sent={resentNotice} countdown={resendIn} t={t} />
            </div>
            <Button type="submit" size="lg" disabled={loading || code.length < 6} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("auth.verifyAndContinue")}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSendMagicLink} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">{t("auth.emailAddress")}</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder={t("auth.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn("h-12", emailInvalid && "border-destructive focus-visible:ring-destructive")}
                aria-invalid={emailInvalid}
                aria-describedby={emailInvalid ? "email-error" : undefined}
              />
              {emailInvalid && (
                <p id="email-error" className="text-xs text-destructive">{t("auth.invalidEmail")}</p>
              )}
            </div>
            <Button type="submit" size="lg" disabled={loading} className="h-12 w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("auth.continue")}
            </Button>
          </form>
        ))}

      {mode === "password" && (
        <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="login-password">{t("auth.password")}</Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                placeholder={t("auth.passwordPlaceholder")}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) setError(null) }}
                className={cn("h-12 pr-10", passwordInvalid && "border-destructive focus-visible:ring-destructive")}
                aria-invalid={passwordInvalid}
                aria-describedby={passwordInvalid ? "login-password-error" : undefined}
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
            {passwordInvalid && (
              <p id="login-password-error" className="text-xs text-destructive">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {t("auth.signingInAs")}<span className="font-medium text-foreground">{email}</span>
            </p>
          </div>
          <Button type="submit" size="lg" disabled={loading} className="h-12 w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("auth.signIn")}
          </Button>
        </form>
      )}

      {mode === "sms" &&
        (codeSent ? (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="sms-code">{t("auth.sixDigitCode")}</Label>
              <CodeBoxes
                id="sms-code"
                value={code}
                onChange={setCode}
                onEscape={() => { setMode("menu"); setCodeSent(false); setCode(""); setError(null) }}
              />
              <p className="text-xs text-muted-foreground text-center">
                {t("auth.sentTo")}
                <span className="font-medium text-foreground">{toE164(phoneCountry, phone)}</span>
              </p>
              <ResendCode onResend={handleResend} resending={resending} sent={resentNotice} countdown={resendIn} t={t} />
            </div>
            <Button type="submit" size="lg" disabled={loading} className="h-12 w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("auth.verifyAndContinue")}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSendCode} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">{t("auth.businessPhoneNumber")}</Label>
              <PhoneInput
                id="phone"
                country={phoneCountry}
                onCountryChange={setPhoneCountryPicked}
                value={phone}
                onValueChange={setPhone}
                placeholder={t("auth.phonePlaceholder")}
                allowedCodes={supportedCodes}
                invalid={phoneInvalid}
                describedBy={phoneInvalid ? "phone-error" : undefined}
              />
              {phoneInvalid && (
                <p id="phone-error" className="text-xs text-destructive">{t("auth.invalidPhone")}</p>
              )}
            </div>
            <Button type="submit" size="lg" disabled={loading} className="h-12 w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("auth.sendVerificationCode")}
            </Button>
          </form>
        ))}
    </div>
  )
}

function ResendCode({
  onResend,
  resending,
  sent,
  countdown,
  t,
}: {
  onResend: () => void
  resending: boolean
  sent: boolean
  countdown: number
  t: (key: string, params?: Record<string, string | number>) => string
}) {
  const waiting = countdown > 0
  return (
    <div className="flex items-center justify-center gap-2 text-sm">
      <button
        type="button"
        onClick={onResend}
        disabled={resending || waiting}
        className="inline-flex items-center gap-1.5 font-medium text-primary transition-colors hover:text-primary/80 disabled:opacity-60 disabled:hover:text-primary"
      >
        {resending && <Loader2 className="h-3 w-3 animate-spin" />}
        {waiting ? t("auth.resendInSeconds", { seconds: countdown }) : t("auth.resendCode")}
      </button>
      {sent && !resending && !waiting && <span className="text-muted-foreground">{t("auth.codeSent")}</span>}
    </div>
  )
}
