"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleIcon } from "@/components/brand-logo"
import { useAuth } from "@/contexts/auth-context"
import { Mail, MessageSquare, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"
import { z } from "zod"

type Mode = "menu" | "email" | "sms"

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address").max(254),
})

const phoneSchema = z.object({
  phone: z.string().min(7, "Please enter a valid phone number").max(20),
})

const codeSchema = z.object({
  code: z.string().min(4, "Code must be at least 4 digits").max(6),
})

export function AuthMethods({ onAuthenticated }: { onAuthenticated?: () => void }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loginWithGoogle, sendMagicLink, sendSmsCode, verifySmsCode } = useAuth()
  const [mode, setMode] = useState<Mode>("menu")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function finish() {
    const from = searchParams.get("from") || "/dashboard"
    router.push(from)
    if (onAuthenticated) onAuthenticated()
  }

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
      await sendMagicLink(email)
      setEmailSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send magic link")
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
        All sign-in options
      </button>

      {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      {mode === "email" &&
        (emailSent ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-secondary/50 p-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-primary" />
            <p className="text-sm font-medium text-foreground">Check your inbox</p>
            <p className="text-sm text-muted-foreground">
              {"We sent a login link to "}
              <span className="font-medium text-foreground">{email}</span>.
            </p>
          </div>
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
              Send Login Link
            </Button>
          </form>
        ))}

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
