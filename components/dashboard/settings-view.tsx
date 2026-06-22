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
import { account, businessCategories, countries, regionsByCountry } from "@/lib/data"

function Flag({ code }: { code: string }) {
  const cc = code.toLowerCase()
  return (
    <img
      src={`https://flagcdn.com/${cc}.svg`}
      alt=""
      aria-hidden="true"
      width={20}
      height={15}
      className="h-[15px] w-[20px] shrink-0 rounded-[2px] object-cover"
    />
  )
}

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

export function SettingsView() {
  const [phoneCountryCode, setPhoneCountryCode] = useState(account.phoneCountryCode)
  const [country, setCountry] = useState(account.country)
  const [region, setRegion] = useState(account.region)

  const regionOptions = regionsByCountry[country]
  const selectedPhoneCountry = countries.find((c) => c.code === phoneCountryCode)
  const selectedCountry = countries.find((c) => c.name === country)
  const phoneCountries = countries.filter((c) => c.code !== "XX")

  function handleCountryChange(value: string) {
    setCountry(value)
    // Reset the region when switching between countries since the options differ.
    setRegion("")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Business information */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-semibold text-foreground">General Business Information</h2>
        <p className="text-sm text-muted-foreground">Update the details your AI receptionist uses on calls.</p>
        <Separator className="my-6" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Business Name" htmlFor="businessName">
            <Input id="businessName" defaultValue={account.businessName} />
          </Field>
          <Field label="Business Category" htmlFor="category">
            <Select defaultValue={account.category}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {businessCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Business Phone Number" htmlFor="businessPhone">
            <div className="flex gap-2">
              <Select value={phoneCountryCode} onValueChange={setPhoneCountryCode}>
                <SelectTrigger className="w-[7.5rem] shrink-0" aria-label="Phone country code">
                  <SelectValue>
                    <span className="flex items-center gap-2">
                      {selectedPhoneCountry && <Flag code={selectedPhoneCountry.code} />}
                      <span>{selectedPhoneCountry?.dialCode}</span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {phoneCountries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="flex items-center gap-2">
                        <Flag code={c.code} />
                        <span>{c.name}</span>
                        <span className="text-muted-foreground">{c.dialCode}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input id="businessPhone" className="flex-1" defaultValue={account.businessPhone} />
            </div>
          </Field>
          <Field label="Email Address" htmlFor="email">
            <Input id="email" type="email" defaultValue={account.email} />
          </Field>
          <Field label="Website URL" htmlFor="websiteUrl">
            <Input
              id="websiteUrl"
              type="url"
              defaultValue={account.websiteUrl}
              placeholder="https://yourbusiness.com"
            />
          </Field>
          <Field label="Forwarding Phone Number" htmlFor="forwardingPhone">
            <Input
              id="forwardingPhone"
              value={account.forwardingPhone}
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
                defaultValue={account.addressLine1}
                placeholder="Street address, P.O. box"
                autoComplete="address-line1"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Address Line 2" htmlFor="addressLine2">
              <Input
                id="addressLine2"
                defaultValue={account.addressLine2}
                placeholder="Apartment, suite, unit, building, floor (optional)"
                autoComplete="address-line2"
              />
            </Field>
          </div>
          <Field label="City / Town" htmlFor="city">
            <Input id="city" defaultValue={account.city} autoComplete="address-level2" />
          </Field>
          <Field label="State / Province / Region" htmlFor="region">
            {regionOptions ? (
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger id="region">
                  <SelectValue placeholder="Select a state/province" />
                </SelectTrigger>
                <SelectContent>
                  {regionOptions.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="State / Province / Region"
                autoComplete="address-level1"
              />
            )}
          </Field>
          <Field label="Postal / ZIP Code" htmlFor="postalCode">
            <Input id="postalCode" defaultValue={account.postalCode} autoComplete="postal-code" />
          </Field>
          <Field label="Country" htmlFor="country">
            <Select value={country} onValueChange={handleCountryChange}>
              <SelectTrigger id="country">
                <SelectValue>
                  <span className="flex items-center gap-2">
                    {selectedCountry && selectedCountry.code !== "XX" && <Flag code={selectedCountry.code} />}
                    <span>{selectedCountry?.name}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.code} value={c.name}>
                    <span className="flex items-center gap-2">
                      {c.code !== "XX" && <Flag code={c.code} />}
                      <span>{c.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="mt-6 flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  )
}
