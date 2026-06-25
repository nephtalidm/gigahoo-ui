"use client"

import { Combobox } from "@base-ui/react/combobox"
import { ChevronDownIcon, CheckIcon, SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { countries, type CountryInfo } from "@/lib/data"
import { cn } from "@/lib/utils"

// Flag image (renders on every OS, unlike emoji flags).
function CountryFlag({ code }: { code: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
      alt=""
      width={18}
      height={13}
      className="h-[13px] w-[18px] shrink-0 rounded-[2px] object-cover shadow-sm ring-1 ring-black/5"
    />
  )
}

/**
 * Searchable country-code selector. Type to filter by country name or dial code
 * (e.g. "mex", "mexico", "+52", "52"); arrow keys navigate, Enter selects.
 */
function CountrySelect({
  country,
  onCountryChange,
}: {
  country: string
  onCountryChange: (countryCode: string) => void
}) {
  const selected = countries.find((c) => c.code === country) ?? countries.find((c) => c.code === "US")!

  return (
    <Combobox.Root
      items={countries}
      value={selected}
      onValueChange={(c: CountryInfo | null) => c && onCountryChange(c.code)}
      itemToStringLabel={(c: CountryInfo) => (c ? `${c.name} ${c.dialCode}` : "")}
    >
      <Combobox.Trigger
        aria-label="Country code"
        className="flex h-8 w-[7.5rem] shrink-0 items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
      >
        <span className="flex items-center gap-1.5">
          <CountryFlag code={selected.code} />
          <span className="text-sm">{selected.dialCode}</span>
        </span>
        <Combobox.Icon className="flex">
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </Combobox.Icon>
      </Combobox.Trigger>

      <Combobox.Portal>
        <Combobox.Positioner side="bottom" align="start" sideOffset={4} className="isolate z-50">
          <Combobox.Popup className="w-[18rem] max-w-[90vw] origin-(--transform-origin) overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <div className="flex items-center gap-2 border-b border-border px-2.5 py-2">
              <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
              <Combobox.Input
                placeholder="Search country…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Combobox.Empty className="px-3 py-6 text-center text-sm text-muted-foreground empty:hidden">
              No countries found.
            </Combobox.Empty>
            <Combobox.List className="max-h-64 overflow-y-auto p-1">
              {(c: CountryInfo, index: number) => (
                <Combobox.Item
                  key={c.code}
                  value={c}
                  index={index}
                  className="relative flex w-full cursor-pointer items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden transition-shadow select-none hover:bg-accent hover:shadow-md data-highlighted:bg-accent data-highlighted:text-accent-foreground data-highlighted:shadow-md"
                >
                  <CountryFlag code={c.code} />
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-muted-foreground">{c.dialCode}</span>
                  <Combobox.ItemIndicator className="absolute right-2 flex items-center">
                    <CheckIcon className="size-4" />
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  )
}

/**
 * Phone number field with a searchable country-code selector. Manages two values:
 *  - `country`  : ISO country code (e.g. "US") stored as account.phoneCountryCode
 *  - `value`    : the local phone-number digits stored as account.businessPhone
 */
export function PhoneInput({
  id,
  country,
  onCountryChange,
  value,
  onValueChange,
  placeholder = "(555) 000-0000",
  invalid,
  describedBy,
}: {
  id?: string
  country: string
  onCountryChange: (countryCode: string) => void
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  invalid?: boolean
  describedBy?: string
}) {
  return (
    <div className="flex gap-2">
      <CountrySelect country={country} onCountryChange={onCountryChange} />
      <Input
        id={id}
        type="tel"
        inputMode="tel"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className={cn("flex-1", invalid && "border-destructive focus-visible:ring-destructive")}
        aria-invalid={invalid}
        aria-describedby={describedBy}
      />
    </div>
  )
}
