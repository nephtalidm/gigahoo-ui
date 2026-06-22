import type { CallData, AccountData, PlanData } from "@/lib/api";

// ── Types ──

export type Plan = "Free" | "Starter" | "Business"

export type CallStatus = "Answered" | "Completed" | "Missed" | "Failed"

export type Call = {
  id: string
  callerName: string
  callerPhone: string
  dateTime: string
  durationSeconds: number
  language: string
  summary: string
  status: CallStatus
  collectedInfo: { label: string; value: string }[]
}

export type Account = {
  businessName: string
  category: string
  categoryId: number
  businessPhone: string
  email: string
  serviceArea: string
  phoneCountryCode: string
  addressLine1: string
  addressLine2: string
  city: string
  region: string
  postalCode: string
  country: string
  countryId: number
  websiteUrl: string
  businessHours: string
  forwardingPhone: string
  plan: Plan
  planId: number
  includedMinutes: number
  billingPeriod: string
  minutesUsed: number
}

export type LinkedAccount = {
  type: "Google" | "Email" | "Phone"
  value: string
  primary: boolean
}

// ── Mappers (API → UI types) ──

export function mapApiCall(c: CallData): Call {
  return {
    id: c.id,
    callerName: c.callerName ?? "Unknown Caller",
    callerPhone: c.callerPhone,
    dateTime: c.dateTimeUtc,
    durationSeconds: c.durationSeconds,
    language: c.language,
    summary: c.summary ?? "",
    status: c.status as CallStatus,
    collectedInfo: c.collectedInfo,
  };
}

export function mapApiAccount(a: AccountData): Account {
  return {
    businessName: a.businessName,
    category: a.category,
    categoryId: a.categoryId,
    businessPhone: a.businessPhone,
    email: a.email,
    serviceArea: a.serviceArea ?? "",
    phoneCountryCode: a.phoneCountryCode,
    addressLine1: a.addressLine1 ?? "",
    addressLine2: a.addressLine2 ?? "",
    city: a.city ?? "",
    region: a.region ?? "",
    postalCode: a.postalCode ?? "",
    country: a.country,
    countryId: a.countryId,
    websiteUrl: a.websiteUrl ?? "",
    businessHours: a.businessHours ?? "",
    forwardingPhone: a.forwardingPhone ?? "",
    plan: a.plan as Plan,
    planId: a.planId,
    includedMinutes: a.includedMinutes,
    billingPeriod: a.billingPeriod,
    minutesUsed: a.minutesUsed,
  };
}

// ── Static lookup data (used for rendering; API data used for ID mapping) ──

export const businessCategories = [
  "Appliance Repair",
  "Cleaning",
  "Electrical",
  "Garage Door Repair",
  "HVAC",
  "Locksmith",
  "Plumbing",
  "Roofing",
  "Other",
]

export const languages = [
  "English",
  "French",
  "Mandarin",
  "Cantonese",
  "Spanish",
  "Japanese",
  "Hindi",
  "Korean",
  "Tagalog",
]

export type CountryInfo = {
  name: string
  code: string
  dialCode: string
  flag: string
}

export const countries: CountryInfo[] = [
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦" },
  { name: "Mexico", code: "MX", dialCode: "+52", flag: "🇲🇽" },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺" },
  { name: "Brazil", code: "BR", dialCode: "+55", flag: "🇧🇷" },
  { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷" },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪" },
  { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳" },
  { name: "Ireland", code: "IE", dialCode: "+353", flag: "🇮🇪" },
  { name: "Italy", code: "IT", dialCode: "+39", flag: "🇮🇹" },
  { name: "Japan", code: "JP", dialCode: "+81", flag: "🇯🇵" },
  { name: "Netherlands", code: "NL", dialCode: "+31", flag: "🇳🇱" },
  { name: "New Zealand", code: "NZ", dialCode: "+64", flag: "🇳🇿" },
  { name: "Singapore", code: "SG", dialCode: "+65", flag: "🇸🇬" },
  { name: "South Africa", code: "ZA", dialCode: "+27", flag: "🇿🇦" },
  { name: "Spain", code: "ES", dialCode: "+34", flag: "🇪🇸" },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "🇦🇪" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧" },
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" },
  { name: "Other", code: "XX", dialCode: "+", flag: "🌐" },
]

export const regionsByCountry: Record<string, string[]> = {
  "United States": [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
    "Wisconsin", "Wyoming", "District of Columbia",
  ],
  Canada: [
    "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador",
    "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island",
    "Quebec", "Saskatchewan", "Yukon",
  ],
  Mexico: [
    "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas",
    "Chihuahua", "Coahuila", "Colima", "Durango", "Guanajuato", "Guerrero", "Hidalgo",
    "Jalisco", "México", "Mexico City", "Michoacán", "Morelos", "Nayarit", "Nuevo León",
    "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora",
    "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas",
  ],
}

// ── Formatting helpers ──

export function formatDuration(seconds: number) {
  if (seconds <= 0) return "—"
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}
