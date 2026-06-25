"use client"

import { useState, useEffect } from "react"
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
import { PhoneInput } from "@/components/phone-input"
import { businessCategories, businessCategoryKeys, countries, type Plan } from "@/lib/data"
import { getAccount, getCategories, api, createCheckout } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useTranslation } from "@/contexts/language-context"
import { useDefaultPhoneCountry } from "@/hooks/use-default-phone-country"
import { cn } from "@/lib/utils"
import { Check, Loader2 } from "lucide-react"
import { z } from "zod"

const plans: { name: Plan; planId: number; price: string; featured?: boolean; descKey: string; featureKeys: string[] }[] = [
  {
    name: "Free", planId: 1, price: "$0",
    descKey: "home.pricingFreeDescription",
    featureKeys: [
      "home.pricingFreeFeature1", "home.pricingFreeFeature2", "home.pricingFreeFeature3",
      "home.pricingFreeFeature4", "home.pricingFreeFeature5",
    ],
  },
  {
    name: "Starter", planId: 2, price: "$49", featured: true,
    descKey: "home.pricingStarterDescription",
    featureKeys: ["home.pricingStarterFeature1"],
  },
  {
    name: "Business", planId: 3, price: "$99",
    descKey: "home.pricingBusinessDescription",
    featureKeys: ["home.pricingBusinessFeature1", "home.pricingBusinessFeature2"],
  },
]

type FieldErrors = {
  email?: string
  password?: string
  businessName?: string
  businessPhone?: string
  category?: string
  addressLine1?: string
  city?: string
  region?: string
  postalCode?: string
  country?: string
  plan?: string
  general?: string
}

// The preselected plan survives the login/verification redirects (which drop the
// ?plan query param) by being persisted to localStorage.
const SIGNUP_PLAN_KEY = "gigahoo_signup_plan"
function normalizePlan(value: string | null | undefined): Plan | null {
  switch (value?.toLowerCase()) {
    case "free": return "Free"
    case "starter": return "Starter"
    case "business": return "Business"
    default: return null
  }
}

export function SignupFlow() {
  const router = useRouter()
  const params = useSearchParams()
  const { storeAuth } = useAuth()
  const { t } = useTranslation()
  const [checkingAccount, setCheckingAccount] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<Plan>("Starter")
  const [category, setCategory] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [businessPhone, setBusinessPhone] = useState("")
  const defaultPhoneCountry = useDefaultPhoneCountry()
  const [phoneCountryPicked, setPhoneCountryPicked] = useState<string | null>(null)
  const phoneCountryCode = phoneCountryPicked ?? defaultPhoneCountry
  // Business address (used by Twilio regulatory bundles; the country also drives
  // the phone number's country and billing currency).
  const [addressLine1, setAddressLine1] = useState("")
  const [addressLine2, setAddressLine2] = useState("")
  const [city, setCity] = useState("")
  const [region, setRegion] = useState("")
  const [postalCode, setPostalCode] = useState("")
  // Gigahoo is currently only available in the US and Canada, so the address
  // country selector is limited to those two.
  const supportedCountries = countries.filter((c) => c.code === "US" || c.code === "CA")
  // Defaults to the phone country (until the user changes it); if the phone
  // country isn't US/CA, default the selector to "US".
  const [addressCountryPicked, setAddressCountryPicked] = useState<string | null>(null)
  const addressCountry =
    addressCountryPicked ??
    (phoneCountryCode === "US" || phoneCountryCode === "CA" ? phoneCountryCode : "US")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [email, setEmail] = useState("")
  // The verified contact is shown read-only; the other contact is collected:
  //  - email signup -> email read-only, ask for phone
  //  - phone signup -> phone read-only, ask for email
  const [isPhoneSignup, setIsPhoneSignup] = useState(false)
  const [isGoogleSignup, setIsGoogleSignup] = useState(false)
  // A password is only collected for plain-email signups. SMS and Google are
  // passwordless (a password can be added later in Settings).
  const isEmailSignup = !isPhoneSignup && !isGoogleSignup

  // Read the verified contact(s) from the JWT (account may not be loaded yet).
  useEffect(() => {
    const token = localStorage.getItem("gigahoo_token")
    if (!token) return
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      const claimEmail = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]
      const claimPhone = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone"]
      setIsGoogleSignup(payload["google_linked"] === "true")
      if (claimEmail && typeof claimEmail === "string") {
        // Email signup: email is verified (read-only); phone is collected.
        setEmail(claimEmail)
        setIsPhoneSignup(false)
      } else {
        // Phone (SMS) signup: phone is verified (read-only); email is collected.
        setEmail("")
        setIsPhoneSignup(true)
        if (claimPhone && typeof claimPhone === "string") setBusinessPhone(claimPhone)
      }
    } catch {
      setEmail("")
      setIsPhoneSignup(true)
    }
  }, [])

  // Real-time validation (only after user interacts)
  useEffect(() => {
    const e: FieldErrors = {}
    if (businessName.length > 200) e.businessName = t("signup.errBusinessNameLong")
    if (businessPhone.length > 0 && businessPhone.replace(/\D/g, "").length < 7) e.businessPhone = t("signup.errPhoneInvalid")
    if (businessPhone.replace(/\D/g, "").length > 15) e.businessPhone = t("signup.errPhoneLong")
    if (isEmailSignup && password.length > 0 && password.length < 8) e.password = t("signup.errPasswordShort")
    if (isPhoneSignup && email.length > 0 && !z.string().email().safeParse(email).success) e.email = t("signup.errEmailInvalid")
    if (addressLine1.length > 200) e.addressLine1 = t("signup.errAddressLong")
    if (city.length > 100) e.city = t("signup.errAddressLong")
    if (region.length > 100) e.region = t("signup.errAddressLong")
    if (postalCode.length > 20) e.postalCode = t("signup.errAddressLong")
    setErrors(e)
  }, [businessName, businessPhone, password, category, email, isPhoneSignup, isEmailSignup, addressLine1, city, region, postalCode, t])

  const emailValid = z.string().email().safeParse(email).success
  const isValid =
    businessName.trim().length >= 1 &&
    businessName.length <= 200 &&
    businessPhone.replace(/\D/g, "").length >= 7 &&
    businessPhone.replace(/\D/g, "").length <= 15 &&
    !!category &&
    !!selectedPlan &&
    addressLine1.trim().length >= 1 &&
    addressLine1.length <= 200 &&
    city.trim().length >= 1 &&
    city.length <= 100 &&
    region.trim().length >= 1 &&
    region.length <= 100 &&
    postalCode.trim().length >= 1 &&
    postalCode.length <= 20 &&
    !!addressCountry &&
    (!isEmailSignup || password.length >= 8) &&
    emailValid

  // Resolve the preselected plan from the URL (?plan=) or a value persisted
  // before an auth redirect, and persist URL values so they survive the
  // login/verification round-trip (which strips the query param).
  useEffect(() => {
    const fromUrl = normalizePlan(params.get("plan"))
    if (fromUrl) {
      try { localStorage.setItem(SIGNUP_PLAN_KEY, fromUrl) } catch {}
      setSelectedPlan(fromUrl)
      return
    }
    const stored = normalizePlan(localStorage.getItem(SIGNUP_PLAN_KEY))
    if (stored) setSelectedPlan(stored)
  }, [params])

  // Check if user already has a completed account — if so, skip to dashboard.
  useEffect(() => {
    const token = localStorage.getItem("gigahoo_token")
    if (!token) {
      router.replace("/login")
      return
    }
    getAccount()
      .then((acc) => {
        if (acc.businessName && acc.businessName.trim().length > 0) {
          router.replace("/dashboard")
        } else {
          setCheckingAccount(false)
        }
      })
      .catch(() => {
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
      setErrors({ general: t("signup.errEmailMissing") })
      setLoading(false)
      return
    }

    try {
      const categories = await getCategories()
      const cat = categories.find((c) => c.name === category)
      if (!cat) {
        setErrors({ category: t("signup.errCategoryInvalid") })
        setLoading(false)
        return
      }

      const response = await api.post<{ token: string; expiresAt: string; account: unknown }>("/api/account", {
        businessName,
        categoryId: cat.id,
        businessPhone,
        phoneCountryCode,
        email,
        planId: plans.find((p) => p.name === selectedPlan)!.planId,
        addressLine1,
        addressLine2,
        city,
        region,
        postalCode,
        countryCode: addressCountry,
        // Omit when empty (SMS/Google are passwordless) so the optional,
        // min-length-8 backend field stays null instead of failing on "".
        password: password || undefined,
      })

      try { localStorage.removeItem(SIGNUP_PLAN_KEY) } catch {}
      storeAuth({ accessToken: response.token, expiresAt: response.expiresAt })

      // Paid plans collect a card via Stripe Checkout; Free goes straight to the dashboard.
      if (selectedPlan !== "Free") {
        const planId = plans.find((p) => p.name === selectedPlan)!.planId
        const { url } = await createCheckout(planId)
        window.location.href = url
        return
      }
      router.push("/dashboard")
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("signup.errGeneric")
      if (msg.toLowerCase().includes("email")) {
        setErrors({ general: t("signup.errEmailTaken") })
      } else if (msg.toLowerCase().includes("phone")) {
        setErrors({ businessPhone: t("signup.errPhoneTaken") })
      } else {
        setErrors({ general: msg })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("signup.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("signup.subtitle")}</p>
      </div>

      {errors.general && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{errors.general}</p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
      {/* Row 1: Business Name, Password */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="businessName">{t("signup.businessNameLabel")}</Label>
        <Input
          name="businessName"
          id="businessName"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder={t("signup.businessNamePlaceholder")}
          maxLength={200}
          className={cn(errors.businessName && "border-destructive focus-visible:ring-destructive")}
          aria-invalid={!!errors.businessName}
          aria-describedby={errors.businessName ? "businessName-error" : undefined}
        />
        {errors.businessName && (
          <p id="businessName-error" className="text-xs text-destructive">{errors.businessName}</p>
        )}
      </div>

      {isEmailSignup && (
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">{t("signup.passwordLabel")}</Label>
        <div className="relative">
          <Input
            name="password"
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("signup.passwordPlaceholder")}
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
      )}

      {/* Row 2: Business Category, then the missing contact — Email (SMS
          signups) or Phone (email signups). */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="category">{t("signup.categoryLabel")}</Label>
        <Select value={category} onValueChange={(v) => { if (v) { setCategory(v); setErrors((e) => ({ ...e, category: undefined })) } }}>
          <SelectTrigger id="category" className={cn("w-full", errors.category && "border-destructive focus-visible:ring-destructive")}>
            <SelectValue placeholder={t("signup.categoryPlaceholder")}>
              {category ? t(`categories.${businessCategoryKeys[category]}`) : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {businessCategories.map((c) => (
              <SelectItem key={c} value={c}>{t(`categories.${businessCategoryKeys[c]}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-xs text-destructive">{errors.category}</p>
        )}
      </div>

      {isPhoneSignup && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">{t("signup.emailLabel")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("signup.emailPlaceholder")}
            maxLength={254}
            className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : "email-hint"}
          />
          {errors.email ? (
            <p id="email-error" className="text-xs text-destructive">{errors.email}</p>
          ) : (
            <p id="email-hint" className="text-xs text-muted-foreground">{t("signup.emailHint")}</p>
          )}
        </div>
      )}

      {!isPhoneSignup && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">{t("signup.phoneLabel")}</Label>
          <PhoneInput
            id="phone"
            country={phoneCountryCode}
            onCountryChange={setPhoneCountryPicked}
            value={businessPhone}
            onValueChange={setBusinessPhone}
            invalid={!!errors.businessPhone}
            describedBy={errors.businessPhone ? "phone-error" : undefined}
          />
          {errors.businessPhone && (
            <p id="phone-error" className="text-xs text-destructive">{errors.businessPhone}</p>
          )}
        </div>
      )}

      {/* Row 3+: Business address. The country drives the phone number's
          country and the billing currency, and is required by Twilio's
          regulatory bundles for CA/MX numbers. */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="country">{t("signup.countryLabel")}</Label>
        <Select value={addressCountry} onValueChange={(v) => { if (v) { setAddressCountryPicked(v); setErrors((e) => ({ ...e, country: undefined })) } }}>
          <SelectTrigger id="country" className={cn("w-full", errors.country && "border-destructive focus-visible:ring-destructive")}>
            <SelectValue placeholder={t("signup.countryPlaceholder")}>
              {addressCountry ? countries.find((c) => c.code === addressCountry)?.name : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {supportedCountries.map((c) => (
              <SelectItem key={c.code} value={c.code}>{c.flag} {c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.country && (
          <p className="text-xs text-destructive">{errors.country}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="addressLine1">{t("signup.addressLine1Label")}</Label>
        <Input
          name="addressLine1"
          id="addressLine1"
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
          placeholder={t("signup.addressLine1Placeholder")}
          maxLength={200}
          className={cn(errors.addressLine1 && "border-destructive focus-visible:ring-destructive")}
          aria-invalid={!!errors.addressLine1}
          aria-describedby={errors.addressLine1 ? "addressLine1-error" : undefined}
        />
        {errors.addressLine1 && (
          <p id="addressLine1-error" className="text-xs text-destructive">{errors.addressLine1}</p>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="addressLine2">{t("signup.addressLine2Label")}</Label>
        <Input
          name="addressLine2"
          id="addressLine2"
          value={addressLine2}
          onChange={(e) => setAddressLine2(e.target.value)}
          placeholder={t("signup.addressLine2Placeholder")}
          maxLength={200}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="city">{t("signup.cityLabel")}</Label>
        <Input
          name="city"
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder={t("signup.cityPlaceholder")}
          maxLength={100}
          className={cn(errors.city && "border-destructive focus-visible:ring-destructive")}
          aria-invalid={!!errors.city}
          aria-describedby={errors.city ? "city-error" : undefined}
        />
        {errors.city && (
          <p id="city-error" className="text-xs text-destructive">{errors.city}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="region">{t("signup.regionLabel")}</Label>
        <Input
          name="region"
          id="region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder={t("signup.regionPlaceholder")}
          maxLength={100}
          className={cn(errors.region && "border-destructive focus-visible:ring-destructive")}
          aria-invalid={!!errors.region}
          aria-describedby={errors.region ? "region-error" : undefined}
        />
        {errors.region && (
          <p id="region-error" className="text-xs text-destructive">{errors.region}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="postalCode">{t("signup.postalCodeLabel")}</Label>
        <Input
          name="postalCode"
          id="postalCode"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          placeholder={t("signup.postalCodePlaceholder")}
          maxLength={20}
          className={cn(errors.postalCode && "border-destructive focus-visible:ring-destructive")}
          aria-invalid={!!errors.postalCode}
          aria-describedby={errors.postalCode ? "postalCode-error" : undefined}
        />
        {errors.postalCode && (
          <p id="postalCode-error" className="text-xs text-destructive">{errors.postalCode}</p>
        )}
      </div>
      </div>

      </div>

      <div className="flex flex-col gap-3">
        <Label className="text-center">{t("signup.planLabel")}</Label>
        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map((p) => {
            const selected = selectedPlan === p.name
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => { setSelectedPlan(p.name); setErrors((e) => ({ ...e, plan: undefined })) }}
                aria-pressed={selected}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-5 text-left transition-colors",
                  selected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:bg-accent",
                )}
              >
                {p.featured && (
                  <span className="absolute -top-2.5 right-5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    {t("home.pricingMostPopular")}
                  </span>
                )}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-foreground">{p.name}</span>
                  <span className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                    selected ? "border-primary bg-primary text-primary-foreground" : "border-border",
                  )}>
                    {selected && <Check className="h-3 w-3" />}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight text-foreground">{p.price}</span>
                  <span className="text-xs text-muted-foreground">{t("home.pricingPeriod")}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{t(p.descKey)}</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {p.featureKeys.map((fk) => (
                    <li key={fk} className="flex items-start gap-2 text-xs text-foreground">
                      <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      {t(fk)}
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>
        {errors.plan && (
          <p className="text-xs text-destructive">{errors.plan}</p>
        )}
      </div>

      <div className="mx-auto w-full max-w-md">
        <Button type="submit" size="lg" className="w-full" disabled={loading || !isValid}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("signup.createAccount")}
        </Button>
      </div>
    </form>
  )
}
