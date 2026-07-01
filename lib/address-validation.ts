// Google Address Validation API — verifies a typed address and returns Google's
// standardized version, used to offer a "Did you mean…?" suggestion popup.
// https://developers.google.com/maps/documentation/address-validation
// Called client-side with the public Maps key (the browser's referer satisfies
// the key's HTTP-referrer restriction).
const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export type AddressToValidate = {
  addressLines: string[]
  locality: string          // city
  administrativeArea: string // state/province (code or name)
  postalCode: string
  regionCode: string        // ISO country code (US / CA / MX)
}

export type ValidatedAddress = {
  formatted: string         // Google's human-readable standardized address
  line1: string
  city: string
  regionShort: string       // admin_area_level_1 short (matches Region.Code for US/CA)
  regionLong: string
  postalCode: string
  countryCode: string
  hasSuggestion: boolean    // Google changed/inferred something worth offering
  incomplete: boolean       // missing/unconfirmed components — worth flagging
}

function comp(result: any, type: string): { text: string; confirmed: boolean } {
  const c = (result?.address?.addressComponents ?? []).find((x: any) => x.componentType === type)
  return {
    text: c?.componentName?.text ?? "",
    confirmed: c?.confirmationLevel === "CONFIRMED",
  }
}

export async function validateAddress(input: AddressToValidate): Promise<ValidatedAddress | null> {
  if (!KEY) return null
  try {
    const res = await fetch(`https://addressvalidation.googleapis.com/v1:validateAddress?key=${KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: input }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const result = data.result
    if (!result) return null

    const v = result.verdict ?? {}
    const pa = result.address?.postalAddress ?? {}
    const lines: string[] = pa.addressLines ?? []
    const route = comp(result, "route").text
    const streetNumber = comp(result, "street_number").text

    return {
      formatted: result.address?.formattedAddress ?? "",
      line1: lines[0] ?? `${streetNumber} ${route}`.trim(),
      city: pa.locality ?? comp(result, "locality").text,
      regionShort: pa.administrativeArea ?? comp(result, "administrative_area_level_1").text,
      regionLong: comp(result, "administrative_area_level_1").text,
      postalCode: pa.postalCode ?? comp(result, "postal_code").text,
      countryCode: (pa.regionCode ?? input.regionCode ?? "").toUpperCase(),
      // Offer a suggestion when Google replaced or inferred components.
      hasSuggestion: Boolean(v.hasReplacedComponents || v.hasInferredComponents),
      // Flag when the address couldn't be fully confirmed.
      incomplete: v.addressComplete === false || v.possibleNextAction === "FIX",
    }
  } catch {
    return null
  }
}
