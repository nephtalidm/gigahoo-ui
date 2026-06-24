"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { businessCategories, type Plan } from "@/lib/data"
import { createAccount, getAccount, getCategories, api, type CategoryData } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { Check, Loader2 } from "lucide-react"
import { z } from "zod"

const accountSchema = z.object({
  businessName: z.string().min(1, "Business name is required").max(200),
  businessPhone: z.string().min(7, "Enter a valid phone number (at least 7 digits)").max(30),
})

const plans: { name: Plan; planId: number; price: string; blurb: string; minutes: number }[] = [
  { name: "Free", planId: 1, price: "$0", blurb: "24/7 AI receptionist · Multilingual · 25 min/mo", minutes: 25 },
  { name: "Starter", planId: 2, price: "$49", blurb: "Everything in Free, plus 250 min/mo", minutes: 250 },
  { name: "Business", planId: 3, price: "$99", blurb: "Everything in Starter, plus answers service questions · 1,000 min/mo", minutes: 1000 },
]

type FieldErrors = {
  businessName?: string
  businessPhone?: string
  category?: string
  plan?: string
  general?: string
}

export function SignupFlow() {
  const router = useRouter()
  const params = useSearchParams()
  const { storeAuth } = useAuth()
  const planParam = params.get("plan") as Plan | null
  const [checkingAccount, setCheckingAccount] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<Plan>(
    planParam && ["Free", "Starter", "Business"].includes(planParam) ? planParam : "Starter",
  )
  const [category, setCategory] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [businessPhone, setBusinessPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [email, setEmail] = useState<string | null>(null)

  // Get email from JWT claim (account may not be loaded yet)
  useEffect(() => {
    const token = localStorage.getItem("gigahoo_token")
    if (!token) return
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      setEmail(payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || null)
    } catch {
      setEmail(null)
    }
  }, [])

  // Real-time validation (only after user interacts)
  useEffect(() => {
    const e: FieldErrors = {}
    if (businessName.length > 200) e.businessName = "Business name is too long"
    if (businessPhone.length > 0 && businessPhone.replace(/\D/g, "").length < 7) e.businessPhone = "Enter a valid phone number (at least 7 digits)"
    if (businessPhone.replace(/\D/g, "").length > 15) e.businessPhone = "Phone number is too long"
    if (password.length > 0 && password.length < 8) e.password = "Password must be at least 8 characters"
    setErrors(e)
  }, [businessName, businessPhone, password, category])

  const isValid = businessName.trim().length >= 1 && businessName.length <= 200 && businessPhone.replace(/\D/g, "").length >= 7 && businessPhone.replace(/\D/g, "").length <= 15 && category && selectedPlan && password.length >= 8

  // Check if user already has an account — if so, skip to dashboard
  useEffect(() => {
    const token = localStorage.getItem("gigahoo_token")
    if (!token) {
      router.replace("/login")
      return
    }
    getAccount()
      .then(() => {
        // Account exists — go to dashboard
        router.replace("/dashboard")
      })
      .catch(() => {
        // No account — show business setup
        setCheckingAccount(false)
      })
  }, [router])

  if (checkingAccount) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    if (!isValid) return

    setLoading(true)

    if (!email) {
      setErrors({ general: "Email not found. Please sign in again." })
      setLoading(false)
      return
    }

    try {
      const categories = await getCategories()
      const cat = categories.find((c) => c.name === category)
      if (!cat) {
        setErrors({ category: "Please select a valid category" })
        setLoading(false)
        return
      }

      const response = await api.post<{ token: string; expiresAt: string; account: unknown }>("/api/account", {
        businessName,
        categoryId: cat.id,
        businessPhone,
        phoneCountryCode: "US",
        email,
        planId: plans.find((p) => p.name === selectedPlan)!.planId,
        password,
      })

      storeAuth({ accessToken: response.token, expiresAt: response.expiresAt })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create account"
      if (msg.toLowerCase().includes("email")) {
        setErrors({ general: "This email is already registered. Please sign in instead." })
      } else if (msg.toLowerCase().includes("phone")) {
        setErrors({ businessPhone: "This phone number is already in use." })
      } else {
        setErrors({ general: msg })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Tell us about your business</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ll use this to set up your AI receptionist.
        </p>
      </div>

      {errors.general && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{errors.general}</p>
      )}

      {email && (
        <div className="flex flex-col gap-2">
          <Label>Email</Label>
          <div className="rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm text-muted-foreground">
            {email}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            name="password"
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            maxLength={128}
            className={cn("pr-10", errors.password && "border-destructive focus-visible:ring-destructive")}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
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
        {errors.password && (
          <p id="password-error" className="text-xs text-destructive">{errors.password}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="businessName">Business Name</Label>
        <Input
          name="businessName"
          id="businessName"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Summit Plumbing"
          maxLength={200}
          className={cn(errors.businessName && "border-destructive focus-visible:ring-destructive")}
          aria-invalid={!!errors.businessName}
          aria-describedby={errors.businessName ? "businessName-error" : undefined}
        />
        {errors.businessName && (
          <p id="businessName-error" className="text-xs text-destructive">{errors.businessName}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="category">Business Category</Label>
        <Select value={category} onValueChange={(v) => { setCategory(v); setErrors((e) => ({ ...e, category: undefined })) }}>
          <SelectTrigger id="category" className={cn(errors.category && "border-destructive focus-visible:ring-destructive")}>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {businessCategories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-xs text-destructive">{errors.category}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Business Phone Number</Label>
        <Input
          name="businessPhone"
          id="phone"
          type="tel"
          value={businessPhone}
          onChange={(e) => setBusinessPhone(e.target.value)}
          placeholder="(555) 000-0000"
          maxLength={30}
          className={cn(errors.businessPhone && "border-destructive focus-visible:ring-destructive")}
          aria-invalid={!!errors.businessPhone}
          aria-describedby={errors.businessPhone ? "phone-error" : undefined}
        />
        {errors.businessPhone && (
          <p id="phone-error" className="text-xs text-destructive">{errors.businessPhone}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Plan</Label>
        <div className="grid gap-2">
          {plans.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => { setSelectedPlan(p.name); setErrors((e) => ({ ...e, plan: undefined })) }}
              className={cn(
                "flex items-center justify-between rounded-xl border p-3 text-left transition-colors",
                selectedPlan === p.name
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:bg-accent",
              )}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.minutes} min</span>
                </div>
                <p className="text-xs text-muted-foreground">{p.blurb}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">{p.price}</span>
                <span className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full border",
                  selectedPlan === p.name
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border",
                )}>
                  {selectedPlan === p.name && <Check className="h-3 w-3" />}
                </span>
              </div>
            </button>
          ))}
        </div>
        {errors.plan && (
          <p className="text-xs text-destructive">{errors.plan}</p>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={loading || !isValid}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create account
      </Button>
    </form>
  )
}
