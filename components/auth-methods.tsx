"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleIcon } from "@/components/brand-logo"
import { sendMagicLink, sendSmsCode, signInWithGoogle, verifySmsCode } from "@/lib/data"
import { Mail, MessageSquare, ArrowLeft, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

type Mode = "menu" | "email" | "sms"

export function AuthMethods({ onAuthenticated }: { onAuthenticated?: () => void }) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("menu")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)

  function finish() {
    if (onAuthenticated) onAuthenticated()
    else router.push("/dashboard")
  }

  async function handleGoogle() {
    setLoading(true)
    await signInWithGoogle()
    setLoading(false)
    finish()
  }

  async function handleSendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await sendMagicLink(email)
    setLoading(false)
    setEmailSent(true)
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await sendSmsCode(phone)
    setLoading(false)
    setCodeSent(true)
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await verifySmsCode(phone, code)
    setLoading(false)
    finish()
  }

  if (mode === "menu") {
    return (
      <div className="flex flex-col gap-3">
        <Button onClick={handleGoogle} disabled={loading} variant="outline" size="lg" className="w-full justify-center gap-3">
          <GoogleIcon className="h-5 w-5" />
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
        }}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All sign-in options
      </button>

      {mode === "email" &&
        (emailSent ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-secondary/50 p-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-primary" />
            <p className="text-sm font-medium text-foreground">Check your inbox</p>
            <p className="text-sm text-muted-foreground">
              {"We sent a login link to "}
              <span className="font-medium text-foreground">{email}</span>.
            </p>
            <Button variant="ghost" size="sm" onClick={finish}>
              Continue to demo dashboard
            </Button>
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
              Send Verification Code
            </Button>
          </form>
        ))}
    </div>
  )
}
