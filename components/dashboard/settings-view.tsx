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
import { updateAccount, type AccountData, type CountryData, type RegionData } from "@/lib/api"
import { businessCategories } from "@/lib/data"
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
  const [businessName, setBusinessName] = useState(account.businessName)
  const [categoryId, setCategoryId] = useState(String(account.categoryId))
  const [businessPhone, setBusinessPhone] = useState(account.businessPhone)
  const [phoneCountryCode, setPhoneCountryCode] = useState(account.phoneCountryCode)
  const [email, setEmail] = useState(account.email)
  const [websiteUrl, setWebsiteUrl] = useState(account.websiteUrl ?? "")
  const [serviceArea, setServiceArea] = useState(account.serviceArea ?? "")
  const [businessHours, setBusinessHours] = useState(account.businessHours ?? "")
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
      await updateAccount({
        businessName,
        categoryId: Number(categoryId),
        businessPhone,
        phoneCountryCode,
        email,
        websiteUrl: websiteUrl || null,
        serviceArea: serviceArea || null,
        businessHours: businessHours || null,
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
      setError(err instanceof Error ? err.message : "Failed to save changes")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-semibold text-foreground">General Business Information</h2>
        <p className="text-sm text-muted-foreground">Update the details your AI receptionist uses on calls.</p>
        <Separator className="my-6" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Business Name" htmlFor="businessName">
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </Field>
          <Field label="Business Category" htmlFor="category">
            <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {businessCategories.map((cat, i) => (
                  <SelectItem key={cat} value={String(i + 1)}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Business Phone Number" htmlFor="businessPhone">
            <div className="flex gap-2">
              <Select value={phoneCountryCode} onValueChange={(v) => v && setPhoneCountryCode(v)}>
                <SelectTrigger className="w-[7.5rem] shrink-0" aria-label="Phone country code">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.filter((c) => c.code !== "XX").map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      <span>{c.name} ({c.dialCode})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="businessPhone"
                className="flex-1"
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
              />
            </div>
          </Field>
          <Field label="Email Address" htmlFor="email">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Website URL" htmlFor="websiteUrl">
            <Input
              id="websiteUrl"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourbusiness.com"
            />
          </Field>
          <Field label="Service Area" htmlFor="serviceArea">
            <Input
              id="serviceArea"
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
              placeholder="e.g., San Francisco Bay Area"
            />
          </Field>
          <Field label="Business Hours" htmlFor="businessHours">
            <Input
              id="businessHours"
              value={businessHours}
              onChange={(e) => setBusinessHours(e.target.value)}
              placeholder="e.g., Mon-Fri 9am-5pm"
            />
          </Field>
          <Field label="Forwarding Phone Number" htmlFor="forwardingPhone">
            <Input
              id="forwardingPhone"
              value={account.forwardingPhone ?? "—"}
              readOnly
              disabled
              aria-describedby="forwardingPhoneHint"
              className="bg-muted text-muted-foreground"
            />
            <p id="forwardingPhoneHint" className="text-xs text-muted-foreground">
              This number is managed by Gigahoo and cannot be edited.
            </p>
          </Field>
        </div>

        <Separator className="my-6" />

        <h3 className="font-semibold text-foreground">Business Address</h3>
        <p className="text-sm text-muted-foreground">
          Enter the address fields that apply in your country.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Address Line 1" htmlFor="addressLine1">
              <Input
                id="addressLine1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="Street address, P.O. box"
                autoComplete="address-line1"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Address Line 2" htmlFor="addressLine2">
              <Input
                id="addressLine2"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Apartment, suite, unit, building, floor (optional)"
                autoComplete="address-line2"
              />
            </Field>
          </div>
          <Field label="City / Town" htmlFor="city">
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              autoComplete="address-level2"
            />
          </Field>
          <Field label="State / Province / Region" htmlFor="region">
            {hasRegions ? (
              <Select value={regionId} onValueChange={(v) => v && setRegionId(v)}>
                <SelectTrigger id="region">
                  <SelectValue placeholder="Select a state/province" />
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
                placeholder="State / Province / Region"
                autoComplete="address-level1"
              />
            )}
          </Field>
          <Field label="Postal / ZIP Code" htmlFor="postalCode">
            <Input
              id="postalCode"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              autoComplete="postal-code"
            />
          </Field>
          <Field label="Country" htmlFor="country">
            <Select value={countryId} onValueChange={(v) => v && handleCountryChange(v)}>
              <SelectTrigger id="country">
                <SelectValue />
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

        <h3 className="font-semibold text-foreground">Account Security</h3>
        <p className="text-sm text-muted-foreground">
          Manage your linked authentication methods.
        </p>
        <div className="mt-5 space-y-4">
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
                <p className="text-sm font-medium text-foreground">Google</p>
                <p className="text-xs text-muted-foreground">Not linked</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Link</Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Email</p>
                <p className="text-xs text-muted-foreground">{account.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Change</Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Phone Number</p>
                <p className="text-xs text-muted-foreground">{account.businessPhone}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Change</Button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              Saved
            </span>
          )}
          {error && <span className="text-sm text-destructive">{error}</span>}
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
