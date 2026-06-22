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
