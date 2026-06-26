"use client"

import { useState } from "react"
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
import { GoogleSignInButton } from "@/components/google-signin-button"
import { CodeBoxes } from "@/components/code-boxes"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useTranslation } from "@/contexts/language-context"
import {
  updateAccount,
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
import { businessCategories, businessCategoryKeys, toE164 } from "@/lib/data"
import { useSupportedCountries } from "@/hooks/use-supported-countries"
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
  open, id, title, description, waitingLabel, cancelLabel, confirmLabel,
  code, setCode, busy, error, onCancel, onConfirm,
}: {
  open: boolean
  id: string
  title: string
  description: string
  waitingLabel: string
  cancelLabel: string
  confirmLabel: string
  code: string
  setCode: (v: string) => void
  busy: boolean
  error: string | null
  onCancel: () => void
  onConfirm: () => void
}) {
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
        {error && <p className="text-center text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button type="button" onClick={onConfirm} disabled={busy || code.length < 6}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
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
  const { t } = useTranslation()
  // Supported (served) countries from the API (Country.IsSupported), settings.ts fallback.
  const supportedCodes = useSupportedCountries()
  const [businessName, setBusinessName] = useState(account.businessName)
  const [categoryId, setCategoryId] = useState(String(account.categoryId))
  const [businessPhone, setBusinessPhone] = useState(account.businessPhone)
  const [phoneCountryCode, setPhoneCountryCode] = useState(account.phoneCountryCode)
  const [email, setEmail] = useState(account.email)
  const [websiteUrl, setWebsiteUrl] = useState(account.websiteUrl ?? "")
  const [addressLine1, setAddressLine1] = useState(account.addressLine1 ?? "")
  const [addressLine2, setAddressLine2] = useState(account.addressLine2 ?? "")
  const [city, setCity] = useState(account.city ?? "")
  const [regionId, setRegionId] = useState(account.region ? String(account.region) : "")
  const [regionCustom, setRegionCustom] = useState(account.region ?? "")
  const [postalCode, setPostalCode] = useState(account.postalCode ?? "")
  const [countryId, setCountryId] = useState(String(account.countryId))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Password set/change
  const [showPwForm, setShowPwForm] = useState(false)
  const [curPw, setCurPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)

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

  const emailChanged = email.trim() !== account.email
  const phoneChanged = businessPhone !== account.businessPhone || phoneCountryCode !== account.phoneCountryCode

  const selectedCountry = countries.find((c) => String(c.id) === countryId)
  const hasRegions = regions.length > 0

  function handleCountryChange(value: string) {
    setCountryId(value)
    setRegionId("")
    setRegionCustom("")
    const id = Number(value)
    if (!isNaN(id)) onCountryChange(id)
  }

  async function handleSave() {
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
        phoneCountryCode: account.phoneCountryCode,
        email: account.email,
        websiteUrl: websiteUrl || null,
        addressLine1: addressLine1 || null,
        addressLine2: addressLine2 || null,
        city: city || null,
        regionId: hasRegions && regionId ? Number(regionId) : null,
        regionCustom: !hasRegions && regionCustom ? regionCustom : null,
        postalCode: postalCode || null,
        countryId: Number(countryId),
      })
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
    if (newPw.length < 8) { setPwError(t("settings.passwordTooShort")); return }
    if (newPw !== confirmPw) { setPwError(t("settings.passwordMismatch")); return }
    setPwSaving(true)
    try {
      await apiSetPassword({ currentPassword: account.hasPassword ? curPw : undefined, newPassword: newPw })
      setPwSaved(true)
      setCurPw(""); setNewPw(""); setConfirmPw("")
      setTimeout(() => { setPwSaved(false); setShowPwForm(false) }, 1500)
    } catch (err) {
      setPwError(err instanceof Error ? err.message : t("settings.passwordSaveFailed"))
    } finally {
      setPwSaving(false)
    }
  }

  async function handleRequestEmailChange() {
    setEmailVerifyError(null)
    setEmailVerified(false)
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
      setEmailVerifyOpen(false)
      setEmailVerified(true)
      setTimeout(() => setEmailVerified(false), 3000)
    } catch (err) {
      setEmailVerifyError(err instanceof Error ? err.message : t("settings.verifyFailed"))
    } finally {
      setEmailVerifyBusy(false)
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
    setBusinessPhone(account.businessPhone)
    setPhoneCountryCode(account.phoneCountryCode)
  }

  async function handleRequestPhoneChange() {
    setPhoneVerifyError(null)
    setPhoneVerified(false)
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
      await confirmPhoneChange(toE164(phoneCountryCode, businessPhone), phoneCountryCode, phoneCode)
      account.businessPhone = businessPhone
      account.phoneCountryCode = phoneCountryCode
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
            />
          </Field>
          <Field label={t("settings.businessCategory")} htmlFor="category">
            <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)}>
              <SelectTrigger id="category">
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="self-start"
                  onClick={handleRequestPhoneChange}
                  disabled={phoneVerifyBusy}
                >
                  {phoneVerifyBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("settings.verifySavePhone")}
                </Button>
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
              code={phoneCode}
              setCode={setPhoneCode}
              busy={phoneVerifyBusy}
              error={phoneVerifyError}
              onCancel={handleCancelPhoneChange}
              onConfirm={handleConfirmPhoneChange}
            />
          </Field>
          <Field label={t("settings.email")} htmlFor="email">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {emailVerified && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                {t("settings.emailVerified")}
              </span>
            )}
            {emailChanged && !emailVerifyOpen && (
              <div className="flex flex-col gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="self-start"
                  onClick={handleRequestEmailChange}
                  disabled={emailVerifyBusy}
                >
                  {emailVerifyBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("settings.verifySaveEmail")}
                </Button>
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
              code={emailCode}
              setCode={setEmailCode}
              busy={emailVerifyBusy}
              error={emailVerifyError}
              onCancel={handleCancelEmailChange}
              onConfirm={handleConfirmEmailChange}
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
              value={account.forwardingPhone ?? "—"}
              readOnly
              disabled
              aria-describedby="forwardingPhoneHint"
              className="bg-muted text-muted-foreground"
            />
            <p id="forwardingPhoneHint" className="text-xs text-muted-foreground">
              {t("settings.forwardingPhoneHint")}
            </p>
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
              <Input
                id="addressLine1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder={t("settings.addressLine1Placeholder")}
                autoComplete="address-line1"
              />
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
            />
          </Field>
          <Field label={t("settings.region")} htmlFor="region">
            {hasRegions ? (
              <Select value={regionId} onValueChange={(v) => v && setRegionId(v)}>
                <SelectTrigger id="region">
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
            ) : (
              <Input
                id="region"
                value={regionCustom}
                onChange={(e) => setRegionCustom(e.target.value)}
                placeholder={t("settings.regionPlaceholder")}
                autoComplete="address-level1"
              />
            )}
          </Field>
          <Field label={t("settings.postalCode")} htmlFor="postalCode">
            <Input
              id="postalCode"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              autoComplete="postal-code"
            />
          </Field>
          <Field label={t("settings.country")} htmlFor="country">
            <Select value={countryId} onValueChange={(v) => v && handleCountryChange(v)}>
              <SelectTrigger id="country">
                <SelectValue>
                  {countries.find((c) => String(c.id) === countryId)?.name || t("settings.selectCountry")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
                {account.hasPassword && (
                  <Field label={t("settings.currentPassword")} htmlFor="currentPassword">
                    <Input id="currentPassword" type="password" autoComplete="current-password" value={curPw} onChange={(e) => setCurPw(e.target.value)} />
                  </Field>
                )}
                <Field label={t("settings.newPassword")} htmlFor="newPassword">
                  <Input id="newPassword" type="password" autoComplete="new-password" placeholder={t("settings.passwordPlaceholder")} value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                </Field>
                <Field label={t("settings.confirmPassword")} htmlFor="confirmPassword">
                  <Input id="confirmPassword" type="password" autoComplete="new-password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
          <Button onClick={handleSave} disabled={saving || emailChanged || phoneChanged}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("settings.saveChanges")}
          </Button>
        </div>
      </div>
    </div>
  )
}
