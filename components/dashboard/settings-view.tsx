"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PhoneInput } from "@/components/phone-input"
import { AddressAutocomplete, type ParsedAddress } from "@/components/address-autocomplete"
import { CountryFlag } from "@/components/country-flag"
import { GoogleSignInButton } from "@/components/google-signin-button"
import { CodeBoxes } from "@/components/code-boxes"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useTranslation, isLocale, type Locale } from "@/contexts/language-context"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import {
  updateAccount,
  updateAccountLanguage,
  setPassword as apiSetPassword,
  linkGoogle,
  requestEmailChange,
  confirmEmailChange,
  requestPhoneChange,
  confirmPhoneChange,
  type AccountData,
  type CountryData,
  type RegionData,
} from "@/lib/api"
import { areaCodeMatchesCountry, businessCategories, businessCategoryKeys, formatPhoneDisplay, splitE164, toE164 } from "@/lib/data"
import { useSupportedCountries } from "@/hooks/use-supported-countries"
import { cn } from "@/lib/utils"
import { Loader2, CheckCircle2 } from "lucide-react"

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}

/** Modal shown while waiting for the user to enter an email/phone change code. */
function VerifyModal({
  open, id, title, description, waitingLabel, cancelLabel, confirmLabel, resendLabel, codeSentLabel,
  code, setCode, busy, error, onCancel, onConfirm, onResend,
}: {
  open: boolean
  id: string
  title: string
  description: string
  waitingLabel: string
  cancelLabel: string
  confirmLabel: string
  resendLabel: string
  codeSentLabel: string
  code: string
  setCode: (v: string) => void
  busy: boolean
  error: string | null
  onCancel: () => void
  onConfirm: () => void
  onResend: () => void | Promise<void>
}) {
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  async function handleResend() {
    setResending(true)
    setResent(false)
    try {
      await onResend()
      setResent(true)
      setTimeout(() => setResent(false), 3000)
    } finally {
      setResending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <CodeBoxes id={id} value={code} onChange={setCode} length={6} />
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {waitingLabel}
        </div>
        <div className="flex items-center justify-center gap-2 text-sm">
          {resent ? (
            <span className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              {codeSentLabel}
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={busy || resending}
              className="text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
            >
              {resending && <Loader2 className="mr-1 inline h-3.5 w-3.5 animate-spin" />}
              {resendLabel}
            </button>
          )}
        </div>
        {error && <p className="text-center text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            className="bg-indigo-600 text-white hover:bg-indigo-700"
            onClick={onConfirm}
            disabled={busy || code.length < 6}
          >
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type FieldErrors = {
  businessName?: string
  email?: string
  addressLine1?: string
  city?: string
  region?: string
  postalCode?: string
  category?: string
  country?: string
}

export function SettingsView({
  account,
  countries,
  regions,
  onCountryChange,
}: {
  account: AccountData
  countries: CountryData[]
  regions: RegionData[]
  onCountryChange: (countryId: number) => void
}) {
  const { t, locale, setLocale } = useTranslation()
  const { dirty, setDirty } = useUnsavedChanges()
  // Supported (served) countries from the API (Country.IsSupported), settings.ts fallback.
  const supportedCodes = useSupportedCountries()
  const [businessName, setBusinessName] = useState(account.businessName)
  const [categoryId, setCategoryId] = useState(String(account.categoryId))
  // The stored number is full E.164; the editor shows a country picker + local digits.
  const initialPhone = splitE164(account.businessPhone)
  const [businessPhone, setBusinessPhone] = useState(initialPhone.local)
  const [phoneCountryCode, setPhoneCountryCode] = useState(initialPhone.countryCode)
  const [email, setEmail] = useState(account.email)
  const [websiteUrl, setWebsiteUrl] = useState(account.websiteUrl ?? "")
  const [addressLine1, setAddressLine1] = useState(account.addressLine1 ?? "")
  const [addressLine2, setAddressLine2] = useState(account.addressLine2 ?? "")
  const [city, setCity] = useState(account.city ?? "")
  const [regionId, setRegionId] = useState(account.regionId != null ? String(account.regionId) : "")
  const [postalCode, setPostalCode] = useState(account.postalCode ?? "")
  const [countryId, setCountryId] = useState(String(account.countryId))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<FieldErrors>({})

  // Password set/change
  const [showPwForm, setShowPwForm] = useState(false)
  const [curPw, setCurPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  // Per-field password errors (red border + inline message), validated live.
  const [pwFieldErrors, setPwFieldErrors] = useState<{ current?: string; newPw?: string; confirm?: string }>({})

  // Email change verification
  const [emailVerifyOpen, setEmailVerifyOpen] = useState(false)
  const [emailCode, setEmailCode] = useState("")
  const [emailVerifyBusy, setEmailVerifyBusy] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [emailVerifyError, setEmailVerifyError] = useState<string | null>(null)

  // Phone change verification
  const [phoneVerifyOpen, setPhoneVerifyOpen] = useState(false)
  const [phoneCode, setPhoneCode] = useState("")
  const [phoneVerifyBusy, setPhoneVerifyBusy] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [phoneVerifyError, setPhoneVerifyError] = useState<string | null>(null)

  // Live password validity (flag red as the user types, not only on submit).
  const newPwInvalid = newPw.length > 0 && newPw.length < 8
  const confirmPwInvalid = confirmPw.length > 0 && confirmPw !== newPw

  const emailChanged = email.trim() !== account.email
  // Compare digits only so re-formatting the same number (e.g. "(778) 392-3021"
  // vs a raw "7783923021" from the API) isn't a false "changed".
  const phoneChanged =
    toE164(phoneCountryCode, businessPhone).replace(/\D/g, "") !== (account.businessPhone ?? "").replace(/\D/g, "")

  const selectedCountry = countries.find((c) => String(c.id) === countryId)
  const hasRegions = regions.length > 0

  // ----- Unsaved-changes tracking -----------------------------------------
  // Snapshot of every editable value the user can change on this form. Email
  // and business phone changes persist through their own verify flows (which
  // update `account.*` and reset the inputs), so they're part of the snapshot
  // too — the baseline's email/phone keys are refreshed in those confirm
  // handlers below, leaving any other unsaved edits intact.
  const snapshot = JSON.stringify({
    businessName, categoryId, businessPhone, phoneCountryCode, email,
    websiteUrl, addressLine1, addressLine2, city, regionId,
    postalCode, countryId, language: locale,
  })
  // Captured once on mount as the clean baseline; updated after a successful save.
  const baselineRef = useRef<string>(snapshot)

  // The account's persisted language. The LanguageSwitcher previews a change in
  // the live UI immediately, but it only becomes authoritative on save — if the
  // user leaves without saving, the preview is reverted back to this value.
  const savedLanguageRef = useRef<Locale>(
    isLocale(account.accountLanguage) ? account.accountLanguage : locale,
  )
  // Latest selected locale, read by the unmount cleanup below (whose closure
  // would otherwise capture a stale `locale`).
  const localeRef = useRef(locale)
  localeRef.current = locale

  // Report dirty state whenever the form diverges from the baseline.
  useEffect(() => {
    setDirty(snapshot !== baselineRef.current)
  }, [snapshot, setDirty])

  // Clear the guard when the settings view unmounts. Also revert an unsaved
  // live language preview back to the saved account language, so leaving the
  // page without saving doesn't keep the change.
  useEffect(() => () => {
    setDirty(false)
    if (localeRef.current !== savedLanguageRef.current) {
      setLocale(savedLanguageRef.current)
    }
  }, [setDirty, setLocale])

  // Re-point one field of the saved baseline (used after the email/phone verify
  // flows persist a value out-of-band), so that verified change no longer reads
  // as "unsaved" while leaving any other pending edits flagged.
  function patchBaseline(patch: Record<string, string>) {
    try {
      baselineRef.current = JSON.stringify({ ...JSON.parse(baselineRef.current), ...patch })
    } catch {
      // Baseline is always valid JSON we produced; ignore if somehow not.
    }
  }

  // Build a specific field error for every required-but-empty or invalid field.
  function validateAll(): FieldErrors {
    const e: FieldErrors = {}
    if (businessName.trim().length < 1) e.businessName = t("settings.errBusinessNameRequired")
    if (email.trim().length < 1) e.email = t("settings.errEmailRequired")
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = t("settings.errEmailInvalid")
    if (!categoryId || Number(categoryId) < 1) e.category = t("settings.errCategoryRequired")
    if (!countryId) e.country = t("settings.errCountryRequired")
    if (addressLine1.trim().length < 1) e.addressLine1 = t("settings.errAddressLine1Required")
    if (city.trim().length < 1) e.city = t("settings.errCityRequired")
    if (!regionId) e.region = t("settings.errRegionRequired")
    if (postalCode.trim().length < 1) e.postalCode = t("settings.errPostalCodeRequired")
    return e
  }

  // Live re-validation: once a field becomes valid its red border clears. Only
  // re-validate fields already flagged so untouched fields stay clean.
  useEffect(() => {
    setErrors((prev) => {
      if (Object.keys(prev).length === 0) return prev
      return validateAll()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessName, email, categoryId, countryId, addressLine1, city, regionId, postalCode, hasRegions])

  // Live re-validation of password fields: clear a field's red border once it
  // becomes valid. Only re-validate fields already flagged so untouched fields
  // stay clean. The currentPassword flag (a server "wrong password" error) is
  // cleared as soon as the user edits that field.
  useEffect(() => {
    setPwFieldErrors((prev) => {
      if (Object.keys(prev).length === 0) return prev
      const next = { ...prev }
      if (next.newPw && newPw.length >= 8) delete next.newPw
      if (next.confirm && confirmPw === newPw) delete next.confirm
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newPw, confirmPw])

  function handleCountryChange(value: string) {
    setCountryId(value)
    setRegionId("")
    const id = Number(value)
    if (!isNaN(id)) onCountryChange(id)
  }

  // A Google Places selection may set the country (which reloads the `regions`
  // prop asynchronously). Stash the picked region name/abbreviation here so the
  // effect below can match it to a region id once the new list arrives.
  const pendingRegionRef = useRef<string | null>(null)
  const pendingRegionShortRef = useRef<string | null>(null)

  function handleAddressSelect(a: ParsedAddress) {
    setAddressLine1(a.line1)
    setCity(a.city)
    setPostalCode(a.postalCode)
    // Country: map the ISO-2 code to our country id and trigger a region reload.
    const c = countries.find((x) => x.code === a.countryCode)
    if (c) {
      setCountryId(String(c.id))
      onCountryChange(c.id)
    }
    // Region: remember the incoming name so the effect can resolve it to an id
    // after `regions` reloads; also set the custom text as a fallback for
    // countries without a region list.
    pendingRegionRef.current = a.region || null
    pendingRegionShortRef.current = a.regionShort || null
  }

  // Resolve a pending region (from a Places selection) once the `regions` list
  // for the newly selected country has loaded.
  useEffect(() => {
    if (regions.length === 0 || !pendingRegionRef.current) return
    const pending = pendingRegionRef.current.toLowerCase()
    const pendingShort = (pendingRegionShortRef.current ?? "").toLowerCase()
    const match = regions.find(
      (r) =>
        r.name.toLowerCase() === pending ||
        (pendingShort && (r.code.toLowerCase() === pendingShort || r.name.toLowerCase() === pendingShort)),
    )
    if (match) setRegionId(String(match.id))
    pendingRegionRef.current = null
    pendingRegionShortRef.current = null
  }, [regions])

  async function handleSave() {
    // A pending email/phone change must be verified (or cancelled) first — instead of
    // saving, guide the user to the relevant verify button.
    if (emailChanged || phoneChanged) {
      const btn = phoneChanged
        ? document.getElementById("verify-phone-btn")
        : document.getElementById("verify-email-btn")
      btn?.scrollIntoView({ behavior: "smooth", block: "center" })
      btn?.focus()
      return
    }
    // Client-side field validation: flag each offending field and focus the first.
    const fieldErrors = validateAll()
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      const order: { key: keyof FieldErrors; id: string }[] = [
        { key: "businessName", id: "businessName" },
        { key: "category", id: "category" },
        { key: "email", id: "email" },
        { key: "country", id: "country" },
        { key: "addressLine1", id: "addressLine1" },
        { key: "city", id: "city" },
        { key: "region", id: "region" },
        { key: "postalCode", id: "postalCode" },
      ]
      const first = order.find((f) => fieldErrors[f.key])
      if (first) focusField(first.id)
      return
    }
    setErrors({})
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      // Email and business phone changes require verification and persist only
      // through their own verify flows — never persist unverified edits here.
      await updateAccount({
        businessName,
        categoryId: Number(categoryId),
        businessPhone: account.businessPhone,
        email: account.email,
        websiteUrl: websiteUrl || null,
        addressLine1: addressLine1 || null,
        addressLine2: addressLine2 || null,
        city: city || null,
        regionId: regionId ? Number(regionId) : null,
        postalCode: postalCode || null,
        countryId: Number(countryId),
      })
      // Persist a language change as part of Save (the live UI already previews
      // it). Once saved it becomes the value the unmount revert restores to.
      if (locale !== savedLanguageRef.current) {
        await updateAccountLanguage(locale)
        savedLanguageRef.current = locale
        account.accountLanguage = locale
      }
      // Persist the optional-feature settings through this SAME Save (one button for the page).
      // No-op when the panel isn't mounted (non-Business plans show the upgrade card instead).
      // The saved values are now the clean baseline → clears the dirty guard.
      baselineRef.current = snapshot
      setDirty(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("settings.saveFailed"))
    } finally {
      setSaving(false)
    }
  }

  async function handleLinkGoogle(idToken: string) {
    setError(null)
    try {
      await linkGoogle(idToken)
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("settings.googleLinkFailed"))
    }
  }

  function focusField(id: string) {
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: "smooth", block: "center" })
    el?.focus()
  }

  async function handleSetPassword() {
    setPwError(null)
    setPwSaved(false)
    // Flag each offending password field (red border + inline message).
    const fe: { current?: string; newPw?: string; confirm?: string } = {}
    if (account.requiresCurrentPassword && curPw.length < 1) fe.current = t("settings.currentPasswordRequired")
    if (newPw.length < 8) fe.newPw = t("settings.passwordTooShort")
    if (newPw !== confirmPw) fe.confirm = t("settings.passwordMismatch")
    if (Object.keys(fe).length > 0) {
      setPwFieldErrors(fe)
      return
    }
    setPwFieldErrors({})
    setPwSaving(true)
    try {
      await apiSetPassword({ currentPassword: account.requiresCurrentPassword ? curPw : undefined, newPassword: newPw })
      setPwSaved(true)
      setCurPw(""); setNewPw(""); setConfirmPw("")
      setTimeout(() => { setPwSaved(false); setShowPwForm(false) }, 1500)
    } catch (err) {
      setPwError(err instanceof Error ? err.message : t("settings.passwordSaveFailed"))
      // A failed save with a current-password field almost always means the
      // entered current password was wrong — flag that field red too.
      if (account.requiresCurrentPassword) {
        setPwFieldErrors((prev) => ({ ...prev, current: prev.current ?? "" }))
      }
    } finally {
      setPwSaving(false)
    }
  }

  async function handleRequestEmailChange() {
    setEmailVerifyError(null)
    setEmailVerified(false)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailVerifyError(t("settings.invalidEmail"))
      return
    }
    setEmailVerifyBusy(true)
    try {
      await requestEmailChange(email.trim())
      setEmailCode("")
      setEmailVerifyOpen(true)
    } catch (err) {
      setEmailVerifyError(err instanceof Error ? err.message : t("settings.codeSendFailed"))
    } finally {
      setEmailVerifyBusy(false)
    }
  }

  async function handleConfirmEmailChange() {
    setEmailVerifyError(null)
    setEmailVerifyBusy(true)
    try {
      await confirmEmailChange(email.trim(), emailCode)
      account.email = email.trim()
      setEmail(account.email)
      // The new email is now persisted — fold it into the baseline.
      patchBaseline({ email: account.email })
      setEmailVerifyOpen(false)
      setEmailVerified(true)
      setTimeout(() => setEmailVerified(false), 3000)
    } catch (err) {
      setEmailVerifyError(err instanceof Error ? err.message : t("settings.verifyFailed"))
    } finally {
      setEmailVerifyBusy(false)
    }
  }

  // Re-request a fresh email code (the old one is invalidated after too many
  // wrong attempts). Clears the entered code; the modal shows a "Code sent" hint.
  async function handleResendEmailCode() {
    setEmailVerifyError(null)
    setEmailCode("")
    try {
      await requestEmailChange(email.trim())
    } catch (err) {
      setEmailVerifyError(err instanceof Error ? err.message : t("settings.codeSendFailed"))
      throw err
    }
  }

  async function handleResendPhoneCode() {
    setPhoneVerifyError(null)
    setPhoneCode("")
    try {
      await requestPhoneChange(toE164(phoneCountryCode, businessPhone))
    } catch (err) {
      setPhoneVerifyError(err instanceof Error ? err.message : t("settings.codeSendFailed"))
      throw err
    }
  }

  function handleCancelEmailChange() {
    setEmailVerifyOpen(false)
    setEmailCode("")
    setEmailVerifyError(null)
    setEmail(account.email)
  }

  function handleCancelPhoneChange() {
    setPhoneVerifyOpen(false)
    setPhoneCode("")
    setPhoneVerifyError(null)
    const reset = splitE164(account.businessPhone)
    setBusinessPhone(reset.local)
    setPhoneCountryCode(reset.countryCode)
  }

  async function handleRequestPhoneChange() {
    setPhoneVerifyError(null)
    setPhoneVerified(false)
    // US/CA numbers are 10 digits; reject letters or wrong length before sending a code.
    const phoneDigits = businessPhone.replace(/\D/g, "")
    if (/[a-zA-Z]/.test(businessPhone) || phoneDigits.length !== 10) {
      setPhoneVerifyError(t("settings.invalidPhone"))
      return
    }
    // US/CA share +1; the area code must match the account's stored country.
    if (!areaCodeMatchesCountry(phoneDigits, phoneCountryCode)) {
      setPhoneVerifyError(t("signup.errAreaCodeMismatch"))
      return
    }
    setPhoneVerifyBusy(true)
    try {
      await requestPhoneChange(toE164(phoneCountryCode, businessPhone))
      setPhoneCode("")
      setPhoneVerifyOpen(true)
    } catch (err) {
      setPhoneVerifyError(err instanceof Error ? err.message : t("settings.codeSendFailed"))
    } finally {
      setPhoneVerifyBusy(false)
    }
  }

  async function handleConfirmPhoneChange() {
    setPhoneVerifyError(null)
    setPhoneVerifyBusy(true)
    try {
      await confirmPhoneChange(toE164(phoneCountryCode, businessPhone), phoneCode)
      account.businessPhone = toE164(phoneCountryCode, businessPhone)
      // The new phone is now persisted — fold it into the baseline.
      patchBaseline({ businessPhone, phoneCountryCode })
      setPhoneVerifyOpen(false)
      setPhoneVerified(true)
      setTimeout(() => setPhoneVerified(false), 3000)
    } catch (err) {
      setPhoneVerifyError(err instanceof Error ? err.message : t("settings.verifyFailed"))
    } finally {
      setPhoneVerifyBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-semibold text-foreground">{t("settings.generalInfoTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("settings.generalInfoDescription")}</p>
        <Separator className="my-6" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("settings.businessName")} htmlFor="businessName">
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className={cn(errors.businessName && "border-destructive focus-visible:ring-destructive")}
              aria-invalid={!!errors.businessName}
              aria-describedby={errors.businessName ? "businessName-error" : undefined}
            />
            {errors.businessName && (
              <p id="businessName-error" className="text-xs text-destructive">{errors.businessName}</p>
            )}
          </Field>
          <Field label={t("settings.businessCategory")} htmlFor="category">
            <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)}>
              <SelectTrigger id="category" className={cn(errors.category && "border-destructive focus-visible:ring-destructive")}>
                <SelectValue>
                  {businessCategories[Number(categoryId) - 1]
                    ? t(`categories.${businessCategoryKeys[businessCategories[Number(categoryId) - 1]]}`)
                    : t("settings.selectCategory")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {businessCategories.map((cat, i) => (
                  <SelectItem key={cat} value={String(i + 1)}>
                    {t(`categories.${businessCategoryKeys[cat]}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category}</p>
            )}
          </Field>
          <Field label={t("settings.businessPhone")} htmlFor="businessPhone">
            <PhoneInput
              id="businessPhone"
              country={phoneCountryCode}
              onCountryChange={setPhoneCountryCode}
              value={businessPhone}
              onValueChange={setBusinessPhone}
              allowedCodes={supportedCodes}
            />
            {phoneVerified && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                {t("settings.phoneVerified")}
              </span>
            )}
            {phoneChanged && !phoneVerifyOpen && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-indigo-400 text-indigo-600 shadow-[0_0_16px_2px] shadow-indigo-500/50 ring-1 ring-indigo-400 transition-shadow hover:text-indigo-700 hover:shadow-indigo-500/70"
                    id="verify-phone-btn"
                    onClick={handleRequestPhoneChange}
                    disabled={phoneVerifyBusy}
                  >
                    {phoneVerifyBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("settings.verifySavePhone")}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={handleCancelPhoneChange} disabled={phoneVerifyBusy}>
                    {t("settings.cancel")}
                  </Button>
                </div>
                {phoneVerifyError && <span className="text-sm text-destructive">{phoneVerifyError}</span>}
              </div>
            )}
            <VerifyModal
              open={phoneVerifyOpen}
              id="phoneCode"
              title={t("settings.phoneVerifyTitle")}
              description={t("settings.enterPhoneCode")}
              waitingLabel={t("settings.waitingForConfirmation")}
              cancelLabel={t("settings.cancel")}
              confirmLabel={t("settings.confirm")}
              resendLabel={t("settings.resendCode")}
              codeSentLabel={t("settings.codeSent")}
              code={phoneCode}
              setCode={setPhoneCode}
              busy={phoneVerifyBusy}
              error={phoneVerifyError}
              onCancel={handleCancelPhoneChange}
              onConfirm={handleConfirmPhoneChange}
              onResend={handleResendPhoneCode}
            />
          </Field>
          <Field label={t("settings.email")} htmlFor="email">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-xs text-destructive">{errors.email}</p>
            )}
            {emailVerified && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                {t("settings.emailVerified")}
              </span>
            )}
            {emailChanged && !emailVerifyOpen && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-indigo-400 text-indigo-600 shadow-[0_0_16px_2px] shadow-indigo-500/50 ring-1 ring-indigo-400 transition-shadow hover:text-indigo-700 hover:shadow-indigo-500/70"
                    id="verify-email-btn"
                    onClick={handleRequestEmailChange}
                    disabled={emailVerifyBusy}
                  >
                    {emailVerifyBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("settings.verifySaveEmail")}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={handleCancelEmailChange} disabled={emailVerifyBusy}>
                    {t("settings.cancel")}
                  </Button>
                </div>
                {emailVerifyError && <span className="text-sm text-destructive">{emailVerifyError}</span>}
              </div>
            )}
            <VerifyModal
              open={emailVerifyOpen}
              id="emailCode"
              title={t("settings.emailVerifyTitle")}
              description={t("settings.enterEmailCode")}
              waitingLabel={t("settings.waitingForConfirmation")}
              cancelLabel={t("settings.cancel")}
              confirmLabel={t("settings.confirm")}
              resendLabel={t("settings.resendCode")}
              codeSentLabel={t("settings.codeSent")}
              code={emailCode}
              setCode={setEmailCode}
              busy={emailVerifyBusy}
              error={emailVerifyError}
              onCancel={handleCancelEmailChange}
              onConfirm={handleConfirmEmailChange}
              onResend={handleResendEmailCode}
            />
          </Field>
          <Field label={t("settings.websiteUrl")} htmlFor="websiteUrl">
            <Input
              id="websiteUrl"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder={t("settings.websiteUrlPlaceholder")}
            />
          </Field>
          <Field label={t("settings.forwardingPhone")} htmlFor="forwardingPhone">
            <Input
              id="forwardingPhone"
              value={account.forwardingPhone ? formatPhoneDisplay(account.forwardingPhone) : "—"}
              readOnly
              disabled
              aria-describedby="forwardingPhoneHint"
              className="bg-muted text-muted-foreground"
            />
            <p id="forwardingPhoneHint" className="text-xs text-muted-foreground">
              {t("settings.forwardingPhoneHint")}
            </p>
          </Field>
          <Field label={t("settings.websiteLanguage")} htmlFor="websiteLanguage">
            <LanguageSwitcher />
            <p className="text-xs text-muted-foreground">{t("settings.websiteLanguageHint")}</p>
          </Field>
        </div>

        <Separator className="my-6" />

        <h3 className="font-semibold text-foreground">{t("settings.addressTitle")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("settings.addressDescription")}
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label={t("settings.addressLine1")} htmlFor="addressLine1">
              <AddressAutocomplete
                id="addressLine1"
                value={addressLine1}
                onChange={setAddressLine1}
                onSelect={handleAddressSelect}
                placeholder={t("settings.addressLine1Placeholder")}
                className={cn(errors.addressLine1 && "border-destructive focus-visible:ring-destructive")}
                invalid={!!errors.addressLine1}
                describedBy={errors.addressLine1 ? "addressLine1-error" : undefined}
              />
              {errors.addressLine1 && (
                <p id="addressLine1-error" className="text-xs text-destructive">{errors.addressLine1}</p>
              )}
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label={t("settings.addressLine2")} htmlFor="addressLine2">
              <Input
                id="addressLine2"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder={t("settings.addressLine2Placeholder")}
                autoComplete="address-line2"
              />
            </Field>
          </div>
          <Field label={t("settings.city")} htmlFor="city">
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              autoComplete="address-level2"
              className={cn(errors.city && "border-destructive focus-visible:ring-destructive")}
              aria-invalid={!!errors.city}
              aria-describedby={errors.city ? "city-error" : undefined}
            />
            {errors.city && (
              <p id="city-error" className="text-xs text-destructive">{errors.city}</p>
            )}
          </Field>
          <Field label={t("settings.region")} htmlFor="region">
            <Select value={regionId} onValueChange={(v) => v && setRegionId(v)}>
              <SelectTrigger id="region" className={cn(errors.region && "border-destructive focus-visible:ring-destructive")}>
                <SelectValue>
                  {regions.find((r) => String(r.id) === regionId)?.name || t("settings.selectRegion")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.region && (
              <p id="region-error" className="text-xs text-destructive">{errors.region}</p>
            )}
          </Field>
          <Field label={t("settings.postalCode")} htmlFor="postalCode">
            <Input
              id="postalCode"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              autoComplete="postal-code"
              className={cn(errors.postalCode && "border-destructive focus-visible:ring-destructive")}
              aria-invalid={!!errors.postalCode}
              aria-describedby={errors.postalCode ? "postalCode-error" : undefined}
            />
            {errors.postalCode && (
              <p id="postalCode-error" className="text-xs text-destructive">{errors.postalCode}</p>
            )}
          </Field>
          <Field label={t("settings.country")} htmlFor="country">
            <Select value={countryId} onValueChange={(v) => v && handleCountryChange(v)}>
              <SelectTrigger id="country" className={cn(errors.country && "border-destructive focus-visible:ring-destructive")}>
                <SelectValue>
                  {selectedCountry ? (
                    <span className="flex items-center gap-2">
                      <CountryFlag code={selectedCountry.code} />
                      {selectedCountry.name}
                    </span>
                  ) : (
                    t("settings.selectCountry")
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
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
          </Field>
        </div>

        <Separator className="my-6" />

        <h3 className="font-semibold text-foreground">{t("settings.securityTitle")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("settings.securityDescription")}
        </p>
        <div className="mt-5 space-y-4">
          {/* Password — set (no password yet, e.g. Google accounts) or change */}
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t("settings.passwordMethod")}</p>
                  <p className="text-xs text-muted-foreground">
                    {account.hasPassword ? t("settings.passwordSetStatus") : t("settings.passwordNotSet")}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowPwForm((v) => !v)}>
                {account.hasPassword ? t("settings.change") : t("settings.setPassword")}
              </Button>
            </div>
            {showPwForm && (
              <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
                {account.requiresCurrentPassword && (
                  <Field label={t("settings.currentPassword")} htmlFor="currentPassword">
                    <Input
                      id="currentPassword"
                      type="password"
                      autoComplete="current-password"
                      value={curPw}
                      onChange={(e) => {
                        setCurPw(e.target.value)
                        setPwFieldErrors((prev) => {
                          if (prev.current === undefined) return prev
                          const next = { ...prev }
                          delete next.current
                          return next
                        })
                      }}
                      className={cn(pwFieldErrors.current !== undefined && "border-destructive focus-visible:ring-destructive")}
                      aria-invalid={pwFieldErrors.current !== undefined}
                      aria-describedby={pwFieldErrors.current ? "currentPassword-error" : undefined}
                    />
                    {pwFieldErrors.current && (
                      <p id="currentPassword-error" className="text-xs text-destructive">{pwFieldErrors.current}</p>
                    )}
                  </Field>
                )}
                <Field label={t("settings.newPassword")} htmlFor="newPassword">
                  <Input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder={t("settings.passwordPlaceholder")}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className={cn((newPwInvalid || pwFieldErrors.newPw) && "border-destructive focus-visible:ring-destructive")}
                    aria-invalid={newPwInvalid || !!pwFieldErrors.newPw}
                    aria-describedby={newPwInvalid || pwFieldErrors.newPw ? "newPassword-error" : undefined}
                  />
                  {(newPwInvalid || pwFieldErrors.newPw) && (
                    <p id="newPassword-error" className="text-xs text-destructive">{pwFieldErrors.newPw ?? t("settings.passwordTooShort")}</p>
                  )}
                </Field>
                <Field label={t("settings.confirmPassword")} htmlFor="confirmPassword">
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    className={cn((confirmPwInvalid || pwFieldErrors.confirm) && "border-destructive focus-visible:ring-destructive")}
                    aria-invalid={confirmPwInvalid || !!pwFieldErrors.confirm}
                    aria-describedby={confirmPwInvalid || pwFieldErrors.confirm ? "confirmPassword-error" : undefined}
                  />
                  {(confirmPwInvalid || pwFieldErrors.confirm) && (
                    <p id="confirmPassword-error" className="text-xs text-destructive">{pwFieldErrors.confirm ?? t("settings.passwordMismatch")}</p>
                  )}
                </Field>
                <div className="flex items-center justify-end gap-3">
                  {pwSaved && (
                    <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />{t("settings.passwordSaved")}
                    </span>
                  )}
                  {pwError && <span className="text-sm text-destructive">{pwError}</span>}
                  <Button size="sm" onClick={handleSetPassword} disabled={pwSaving || newPw.length < 8 || newPw !== confirmPw}>
                    {pwSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {account.hasPassword ? t("settings.changePassword") : t("settings.setPassword")}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t("settings.google")}</p>
                <p className="text-xs text-muted-foreground">{account.hasGoogle ? t("settings.linked") : t("settings.notLinked")}</p>
              </div>
            </div>
            {account.hasGoogle ? (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />{t("settings.linked")}
              </span>
            ) : (
              <GoogleSignInButton onCredential={handleLinkGoogle} text="signin" />
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t("settings.emailMethod")}</p>
                <p className="text-xs text-muted-foreground">{account.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => focusField("email")}>{t("settings.change")}</Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t("settings.phoneNumber")}</p>
                <p className="text-xs text-muted-foreground">{account.businessPhone}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => focusField("businessPhone")}>{t("settings.change")}</Button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              {t("settings.saved")}
            </span>
          )}
          {(emailChanged || phoneChanged) && (
            <span className="text-sm text-amber-600">{t("settings.verifyBeforeSave")}</span>
          )}
          {error && <span className="text-sm text-destructive">{error}</span>}
          <Button onClick={handleSave} disabled={saving || !dirty}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("settings.saveChanges")}
          </Button>
        </div>
      </div>
    </div>
  )
}
