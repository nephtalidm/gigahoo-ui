"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PhoneInput } from "@/components/phone-input"
import { AddressAutocomplete } from "@/components/address-autocomplete"
import { validateAddress, type ValidatedAddress } from "@/lib/address-validation"
import { businessCategories, businessCategoryKeys, countries, areaCodeMatchesCountry, toE164, type Plan } from "@/lib/data"
import { getAccount, getCategories, api, subscribePlan, requestSignupPhoneCode, getCurrencyForVisitor, type CountryData, type RegionData } from "@/lib/api"
import { Elements } from "@stripe/react-stripe-js"
import { StripeCardPayForm, stripePromise } from "@/components/stripe-card-form"
import { PLAN_PRICES, COMING_SOON_COUNTRY_CODES } from "@/lib/settings"
import { useAuth } from "@/contexts/auth-context"
import { useTranslation } from "@/contexts/language-context"
import { useDefaultPhoneCountry } from "@/hooks/use-default-phone-country"
import { useSupportedCountries } from "@/hooks/use-supported-countries"
import { CountryFlag } from "@/components/country-flag"
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
    featureKeys: ["home.pricingBusinessFeature1", "home.pricingBusinessFeatureConcurrent", "home.pricingBusinessFeature2"],
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
  terms?: string
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

export function SignupFlow({ countries: apiCountries, regionsByCountryId }: {
  countries: CountryData[]
  regionsByCountryId: Record<number, RegionData[]>
}) {
  const router = useRouter()
  const params = useSearchParams()
  const { storeAuth } = useAuth()
  const { t } = useTranslation()
  const [checkingAccount, setCheckingAccount] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<Plan>("Starter")
  // Embedded card step for paid signups — mounted once the unpaid subscription's
  // PaymentIntent clientSecret arrives. Cancel still lands in the dashboard: the account
  // exists on the Free plan and the upgrade can be finished from there any time.
  const [payClientSecret, setPayClientSecret] = useState<string | null>(null)
  // SMS gate: account creation requires a verified business phone. The modal collects the
  // code; the server verifies it inside the create call itself (the authoritative gate).
  const [phoneVerifyOpen, setPhoneVerifyOpen] = useState(false)
  const [phoneCode, setPhoneCode] = useState("")
  const [phoneVerifyError, setPhoneVerifyError] = useState<string | null>(null)
  const [phoneVerifyBusy, setPhoneVerifyBusy] = useState(false)
  const [pendingAddr, setPendingAddr] = useState<{ addressLine1: string; addressLine2: string; city: string; regionId: string; postalCode: string } | null>(null)
  // Billing currency for the plan amounts, resolved from the visitor's geo
  // country (the same source the homepage Pricing uses). Initialized from the
  // NEXT_CURRENCY cookie so it renders immediately without a flicker.
  const [currency, setCurrency] = useState<string | null>(() =>
    typeof document !== "undefined"
      ? (document.cookie.match(/(?:^|;\s*)NEXT_CURRENCY=([^;]+)/)?.[1] ?? null)
      : null,
  )
  // The visitor's geo country (NEXT_COUNTRY cookie), read synchronously on first
  // render. Used to block the signup form in coming-soon markets (e.g. Mexico).
  const [country] = useState<string>(() =>
    typeof document !== "undefined"
      ? (document.cookie.match(/(?:^|;\s*)NEXT_COUNTRY=([^;]+)/)?.[1] ?? "").toUpperCase()
      : "",
  )
  const comingSoon = COMING_SOON_COUNTRY_CODES.includes(country)
  const [category, setCategory] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [businessPhone, setBusinessPhone] = useState("")
  const defaultPhoneCountry = useDefaultPhoneCountry()
  // Supported (served) countries come from the API (Country.IsSupported), with a
  // settings.ts fallback while loading.
  const supportedCodes = useSupportedCountries()
  const [phoneCountryPicked, setPhoneCountryPicked] = useState<string | null>(null)
  // Clamp the geo-detected default to a supported country when the visitor isn't
  // in one.
  const phoneCountryCode =
    phoneCountryPicked ??
    (supportedCodes.includes(defaultPhoneCountry) ? defaultPhoneCountry : supportedCodes[0])
  // Business address (used by Twilio regulatory bundles; the country also drives
  // the phone number's country and billing currency).
  const [addressLine1, setAddressLine1] = useState("")
  const [addressLine2, setAddressLine2] = useState("")
  const [city, setCity] = useState("")
  const [regionId, setRegionId] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [suggestion, setSuggestion] = useState<ValidatedAddress | null>(null)
  // The address country selector is limited to the supported (served) countries.
  const supportedCountries = countries.filter((c) => supportedCodes.includes(c.code))
  // Defaults to the phone country (until the user changes it); if the phone
  // country isn't supported, default to the first supported country.
  const [addressCountryPicked, setAddressCountryPicked] = useState<string | null>(null)
  const addressCountry =
    addressCountryPicked ??
    (supportedCodes.includes(phoneCountryCode) ? phoneCountryCode : supportedCodes[0])
  // Country + region dropdowns are backed by the server-provided lookup data
  // (props, read from the DB on the server — no browser fetch). Resolve the picked
  // country code to its id, take that country's region list, and reset the region
  // selection whenever the country changes.
  const addressCountryId = apiCountries.find((c) => c.code === addressCountry)?.id ?? null
  const regions = addressCountryId != null ? (regionsByCountryId[addressCountryId] ?? []) : []
  useEffect(() => { setRegionId("") }, [addressCountryId])
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  // Server errors that aren't tied to a specific field (e.g. phone-number
  // provisioning failures on free-plan signup) surface as a blocking modal.
  const [signupError, setSignupError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  // The verified contact is shown read-only; the other contact is collected:
  //  - email signup -> email read-only, ask for phone
  //  - phone signup -> phone read-only, ask for email
  const [isPhoneSignup, setIsPhoneSignup] = useState(false)
  const [isGoogleSignup, setIsGoogleSignup] = useState(false)
  // A password is only collected for plain-email signups. SMS and Google are
  // passwordless (a password can be added later in Settings).
  const isEmailSignup = !isPhoneSignup && !isGoogleSignup

  // Show plan amounts in the visitor's currency (Country.Currency via the API),
  // resolved from the geo country middleware records in a cookie.
  useEffect(() => {
    // Only fetch when the NEXT_CURRENCY cookie isn't already present; cache the
    // result so subsequent renders have it synchronously.
    const cached = document.cookie.match(/(?:^|;\s*)NEXT_CURRENCY=([^;]+)/)?.[1]
    if (cached) return
    const country = (document.cookie.match(/(?:^|;\s*)NEXT_COUNTRY=([^;]+)/)?.[1] ?? "").toUpperCase()
    getCurrencyForVisitor(country)
      .then((c) => {
        if (c.currency) {
          setCurrency(c.currency)
          document.cookie = `NEXT_CURRENCY=${c.currency};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`
        }
      })
      .catch(() => {})
  }, [])

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
    if (postalCode.length > 20) e.postalCode = t("signup.errAddressLong")
    setErrors(e)
  }, [businessName, businessPhone, password, category, email, isPhoneSignup, isEmailSignup, addressLine1, city, regionId, postalCode, t])

  // Used by validateAll() to flag a malformed email on submit. Full required/
  // length validation now lives in validateAll() so each failure maps to its
  // own inline field error.
  const emailValid = z.string().email().safeParse(email).success

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

  // Order matters: the first invalid field in this list is the one we focus and
  // scroll into view on submit. It mirrors the visual top-to-bottom layout.
  function focusField(id: string) {
    if (typeof document === "undefined") return
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
      ;(el as HTMLElement).focus({ preventScroll: true })
    }
  }

  // Build a specific field error for every required-but-empty or invalid field.
  // Only field keys are set here; errors.general is reserved for server/network.
  function validateAll(): FieldErrors {
    const e: FieldErrors = {}
    const phoneDigits = businessPhone.replace(/\D/g, "")

    if (businessName.trim().length < 1) e.businessName = t("signup.errBusinessNameRequired")
    else if (businessName.length > 200) e.businessName = t("signup.errBusinessNameLong")

    if (isEmailSignup && password.length < 1) e.password = t("signup.errPasswordRequired")
    else if (isEmailSignup && password.length < 8) e.password = t("signup.errPasswordShort")

    if (!category) e.category = t("signup.errCategoryRequired")

    if (isPhoneSignup) {
      if (email.trim().length < 1) e.email = t("signup.errEmailRequired")
      else if (!emailValid) e.email = t("signup.errEmailInvalid")
    }

    if (phoneDigits.length < 1) e.businessPhone = t("signup.errPhoneRequired")
    else if (phoneDigits.length < 7) e.businessPhone = t("signup.errPhoneInvalid")
    else if (phoneDigits.length > 15) e.businessPhone = t("signup.errPhoneLong")
    // For +1 (US/CA) numbers the area code must match the selected phone country
    // (e.g. a US area code can't sign up as Canada, and vice versa).
    else if (!areaCodeMatchesCountry(phoneDigits, phoneCountryCode)) e.businessPhone = t("signup.errAreaCodeMismatch")

    if (!addressCountry) e.country = t("signup.errCountryRequired")

    if (addressLine1.trim().length < 1) e.addressLine1 = t("signup.errAddressLine1Required")
    else if (addressLine1.length > 200) e.addressLine1 = t("signup.errAddressLong")

    if (city.trim().length < 1) e.city = t("signup.errCityRequired")
    else if (city.length > 100) e.city = t("signup.errAddressLong")

    if (!regionId) e.region = t("signup.errRegionRequired")

    if (postalCode.trim().length < 1) e.postalCode = t("signup.errPostalCodeRequired")
    else if (postalCode.length > 20) e.postalCode = t("signup.errAddressLong")

    if (!selectedPlan) e.plan = t("signup.errPlanRequired")

    if (!agreedToTerms) e.terms = t("signup.errTermsRequired")

    return e
  }

  async function submitAccount(addr?: { addressLine1: string; addressLine2: string; city: string; regionId: string; postalCode: string }, phoneVerificationCode?: string) {
    const a = addr ?? { addressLine1, addressLine2, city, regionId, postalCode }
    setLoading(true)

    try {
      const categories = await getCategories()
      const cat = categories.find((c) => c.name === category)
      if (!cat) {
        setErrors({ category: t("signup.errCategoryInvalid") })
        focusField("category")
        setLoading(false)
        return
      }

      // SMS GATE: without a code in hand, ask the server. SMS-auth users get verified=true
      // for their own login number and sail through; everyone else gets a code by SMS and
      // the modal collects it - creation then retries with the code attached.
      if (!phoneVerificationCode) {
        const gate = await requestSignupPhoneCode(toE164(phoneCountryCode, businessPhone))
        if (!gate.verified) {
          setPendingAddr(a)
          setPhoneCode("")
          setPhoneVerifyError(null)
          setPhoneVerifyOpen(true)
          setLoading(false)
          return
        }
      }

      const response = await api.post<{ token: string; expiresAt: string; account: unknown }>("/api/account", {
        phoneVerificationCode,
        businessName,
        categoryId: cat.id,
        // Stored as ONE full E.164 string — the country picker only shapes input.
        businessPhone: toE164(phoneCountryCode, businessPhone),
        email,
        planId: plans.find((p) => p.name === selectedPlan)!.planId,
        addressLine1: a.addressLine1,
        addressLine2: a.addressLine2,
        city: a.city,
        regionId: a.regionId ? Number(a.regionId) : null,
        postalCode: a.postalCode,
        countryCode: addressCountry,
        // Omit when empty (SMS/Google are passwordless) so the optional,
        // min-length-8 backend field stays null instead of failing on "".
        password: password || undefined,
        // Default the account's dashboard language to the locale the user signed
        // up in (the current NEXT_LOCALE cookie); server clamps to a supported one.
        language: document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/)?.[1] ?? "en",
      })

      setPhoneVerifyOpen(false)
      try { localStorage.removeItem(SIGNUP_PLAN_KEY) } catch {}
      // navigate: false — the signup flow owns navigation from here: paid plans must stay
      // on this page for the embedded card step; the auto-push would unmount it mid-payment.
      storeAuth({ accessToken: response.token, expiresAt: response.expiresAt }, { navigate: false })

      // Paid plans collect the card RIGHT HERE (embedded, no Stripe redirect); Free goes
      // straight to the dashboard. The subscription is created unpaid and this form's
      // confirmation pays its first invoice — the plan flips only when the payment lands.
      if (selectedPlan !== "Free") {
        const planId = plans.find((p) => p.name === selectedPlan)!.planId
        const res = await subscribePlan(planId)
        if (res.status === "active") {
          router.push("/dashboard")
          return
        }
        if (res.clientSecret) {
          setPayClientSecret(res.clientSecret)
          return
        }
        throw new Error(t("signup.errGeneric"))
      }
      router.push("/dashboard")
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("signup.errGeneric")
      // Phone-code failures surface inside the verification modal (it stays open for retry).
      if (msg.includes("phone_verification_required") || msg.toLowerCase().includes("expired code")) {
        setPhoneVerifyError(t("signup.errCodeInvalid"))
        setPhoneVerifyOpen(true)
        setLoading(false)
        return
      }
      // Map known server errors to their specific field; reserve errors.general
      // for genuinely non-field (server/network) failures.
      if (msg.toLowerCase().includes("email")) {
        // The email field is only rendered (and thus can show an inline error)
        // for phone signups; for email signups the address is read-only from the
        // verified JWT, so surface it as a general error instead.
        if (isPhoneSignup) {
          setErrors({ email: t("signup.errEmailTaken") })
          focusField("email")
        } else {
          setErrors({ general: t("signup.errEmailTaken") })
        }
      } else if (msg.toLowerCase().includes("phone")) {
        setErrors({ businessPhone: t("signup.errPhoneTaken") })
        focusField("phone")
      } else {
        // Genuinely non-field server/network failures (e.g. the API couldn't
        // provision a phone number on free-plan signup). Surface the server's
        // message in a blocking modal; keep errors.general as a fallback too.
        setErrors({ general: msg })
        setSignupError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const fieldErrors = validateAll()
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      // Focus/scroll the first invalid field (top-to-bottom by form layout).
      const order: { key: keyof FieldErrors; id: string }[] = [
        { key: "businessName", id: "businessName" },
        { key: "password", id: "password" },
        { key: "category", id: "category" },
        { key: "email", id: "email" },
        { key: "businessPhone", id: "phone" },
        { key: "country", id: "country" },
        { key: "addressLine1", id: "addressLine1" },
        { key: "city", id: "city" },
        { key: "region", id: "region" },
        { key: "postalCode", id: "postalCode" },
        { key: "terms", id: "agreeToTerms" },
      ]
      const first = order.find((f) => fieldErrors[f.key])
      if (first) focusField(first.id)
      return
    }

    // Ask Google to validate/standardize the address; if it differs, offer it in
    // a "Did you mean…?" dialog. Fail-open: on any validation error, just submit.
    setLoading(true)
    const sug = await validateAddress({
      addressLines: [addressLine1, addressLine2].filter((x): x is string => !!x),
      locality: city,
      administrativeArea: regions.find((r) => String(r.id) === regionId)?.code ?? "",
      postalCode,
      regionCode: addressCountry,
    })
    setLoading(false)
    if (sug && (sug.hasSuggestion || sug.incomplete)) {
      setSuggestion(sug)
      return
    }
    await submitAccount()
  }

  // Apply Google's suggested address, then submit with the corrected values.
  function acceptSuggestion() {
    const s = suggestion
    if (!s) return
    const newRid = regions.find((r) => r.code.toLowerCase() === s.regionShort.toLowerCase())?.id
    setAddressLine1(s.line1)
    setCity(s.city)
    setPostalCode(s.postalCode)
    if (newRid != null) setRegionId(String(newRid))
    setSuggestion(null)
    void submitAccount({
      addressLine1: s.line1,
      addressLine2,
      city: s.city,
      regionId: newRid != null ? String(newRid) : regionId,
      postalCode: s.postalCode,
    })
  }

  // Block the signup form entirely in coming-soon markets (e.g. Mexico). This is
  // placed after every hook (and after the early checkingAccount return) so it
  // doesn't change hook order. Logins are unaffected — this only gates /signup.
  if (comingSoon) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("signup.comingSoonTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("signup.comingSoonBody")}</p>
          <Button size="lg" render={<Link href="/login">{t("signup.logIn")}</Link>} />
        </div>
      </div>
    )
  }

  return (
    <>
    <Dialog open={!!signupError} onOpenChange={(o) => { if (!o) setSignupError(null) }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("signup.errorTitle")}</DialogTitle>
          <DialogDescription>{signupError}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setSignupError(null)}>{t("signup.tryAgain")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <Dialog open={!!suggestion} onOpenChange={(o) => { if (!o) setSuggestion(null) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("signup.addressCheckTitle")}</DialogTitle>
          <DialogDescription>{t("signup.addressCheckBody")}</DialogDescription>
        </DialogHeader>
        <p className="rounded-md border border-border bg-muted/40 p-3 text-sm font-medium">
          {suggestion?.formatted}
        </p>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => { setSuggestion(null); void submitAccount() }}>
            {t("signup.addressCheckKeep")}
          </Button>
          <Button type="button" className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={acceptSuggestion}>
            {t("signup.addressCheckUse")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
            allowedCodes={supportedCodes}
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
              {addressCountry && (
                <span className="flex items-center gap-2">
                  <CountryFlag code={addressCountry} />
                  {countries.find((c) => c.code === addressCountry)?.name}
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {supportedCountries.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                <span className="flex items-center gap-2">
                  <CountryFlag code={c.code} />
                  {c.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.country && (
          <p className="text-xs text-destructive">{errors.country}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="addressLine1">{t("signup.addressLine1Label")}</Label>
        <AddressAutocomplete
          id="addressLine1"
          value={addressLine1}
          onChange={setAddressLine1}
          onSelect={(a) => {
            setAddressLine1(a.line1)
            setCity(a.city)
            // Resolve Google's region (long_name / short_name) to a Region id
            // against the already-loaded list for the selected country.
            const long = (a.region ?? "").toLowerCase()
            const short = (a.regionShort ?? "").toLowerCase()
            const match = regions.find(
              (r) => r.name.toLowerCase() === long ||
                (short && (r.code.toLowerCase() === short || r.name.toLowerCase() === short)),
            )
            if (match) setRegionId(String(match.id))
            setPostalCode(a.postalCode)
          }}
          placeholder={t("signup.addressLine1Placeholder")}
          className={cn(errors.addressLine1 && "border-destructive focus-visible:ring-destructive")}
          invalid={!!errors.addressLine1}
          describedBy={errors.addressLine1 ? "addressLine1-error" : undefined}
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
        <Select value={regionId} onValueChange={(v) => { if (v) { setRegionId(v); setErrors((e) => ({ ...e, region: undefined })) } }}>
          <SelectTrigger
            id="region"
            className={cn(errors.region && "border-destructive focus-visible:ring-destructive")}
            aria-invalid={!!errors.region}
            aria-describedby={errors.region ? "region-error" : undefined}
          >
            <SelectValue>
              {regions.find((r) => String(r.id) === regionId)?.name || t("signup.regionPlaceholder")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {regions.map((r) => (
              <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                  <span className="text-3xl font-bold tracking-tight text-foreground">{PLAN_PRICES[currency ?? ""]?.[p.name] ?? p.price}</span>
                  {p.name !== "Free" && currency && (
                    <span className="text-xs font-medium text-muted-foreground">{currency}</span>
                  )}
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
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="agreeToTerms"
            checked={agreedToTerms}
            onChange={(e) => {
              setAgreedToTerms(e.target.checked)
              if (e.target.checked) setErrors((er) => ({ ...er, terms: undefined }))
            }}
            className={cn(
              "mt-0 h-5 w-5 shrink-0 cursor-pointer rounded border-border text-primary accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              errors.terms && "border-destructive",
            )}
            aria-invalid={!!errors.terms}
            aria-describedby={errors.terms ? "agreeToTerms-error" : undefined}
          />
          <Label htmlFor="agreeToTerms" className="text-sm font-normal leading-snug text-muted-foreground">
            {t("signup.agreeProse")}{" "}
            <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              {t("signup.termsOfService")}
            </Link>{" "}
            {t("signup.agreeAnd")}{" "}
            <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              {t("signup.privacyPolicy")}
            </Link>
          </Label>
        </div>
        {errors.terms && (
          <p id="agreeToTerms-error" className="mt-2 text-xs text-destructive">{errors.terms}</p>
        )}
      </div>

      <div className="mx-auto w-full max-w-md">
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("signup.createAccount")}
        </Button>
      </div>
    </form>
      {phoneVerifyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
            <h2 className="mb-2 text-lg font-semibold text-foreground">{t("signup.verifyPhoneTitle")}</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              {t("signup.verifyPhoneDesc", { phone: toE164(phoneCountryCode, businessPhone) })}
            </p>
            <input
              id="signupPhoneCode"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-center text-lg tracking-widest text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              maxLength={8}
            />
            {phoneVerifyError && <p className="mt-2 text-sm text-destructive">{phoneVerifyError}</p>}
            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={phoneVerifyBusy}
                onClick={() => {
                  setPhoneVerifyBusy(true)
                  setPhoneVerifyError(null)
                  requestSignupPhoneCode(toE164(phoneCountryCode, businessPhone))
                    .catch((e) => setPhoneVerifyError(e instanceof Error ? e.message : t("signup.errGeneric")))
                    .finally(() => setPhoneVerifyBusy(false))
                }}
                className="text-sm font-medium text-primary hover:underline disabled:opacity-60"
              >
                {t("signup.resendCode")}
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPhoneVerifyOpen(false)}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground cursor-pointer transition-colors hover:bg-accent disabled:opacity-60"
                >
                  {t("signup.cancel")}
                </button>
                <button
                  type="button"
                  disabled={loading || phoneCode.length < 4}
                  onClick={() => { setPhoneVerifyError(null); void submitAccount(pendingAddr ?? undefined, phoneCode) }}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm cursor-pointer transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("signup.verifyPhoneCta")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {payClientSecret && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-foreground">{t("billing.completeUpgradeTo", { plan: selectedPlan })}</h2>
            <Elements stripe={stripePromise} options={{ clientSecret: payClientSecret }}>
              <StripeCardPayForm
                submitLabel={t("billing.pay")}
                onSuccess={() => router.push("/dashboard")}
                onCancel={() => router.push("/dashboard")}
              />
            </Elements>
          </div>
        </div>
      )}
    </>
  )
}
