// Mock data + placeholder API functions for the Gigahoo dashboard.
// Frontend-only. Replace these with real API calls later.

export type Plan = "Free" | "Starter" | "Business"

export const PLAN_MINUTES: Record<Plan, number> = {
  Free: 25,
  Starter: 250,
  Business: 1000,
}

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

// Countries with a known fixed list of states/provinces. Others use a free text field.
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

export type Account = {
  businessName: string
  category: string
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
  websiteUrl: string
  businessHours: string
  forwardingPhone: string
  plan: Plan
  billingPeriod: string
  minutesUsed: number
}

export const account: Account = {
  businessName: "Summit Plumbing & Heating",
  category: "Plumbing",
  businessPhone: "(415) 555-0142",
  email: "owner@summitplumbing.com",
  serviceArea: "San Francisco Bay Area",
  phoneCountryCode: "CA",
  addressLine1: "1820 Market St",
  addressLine2: "Suite 200",
  city: "San Francisco",
  region: "California",
  postalCode: "94102",
  country: "Canada",
  websiteUrl: "",
  businessHours: "Mon–Fri 7:00 AM – 6:00 PM",
  forwardingPhone: "(415) 555-0142",
  plan: "Business",
  billingPeriod: "Jun 1 – Jun 30",
  minutesUsed: 437,
}

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

export const calls: Call[] = [
  {
    id: "c1",
    callerName: "Maria Gonzalez",
    callerPhone: "(415) 555-0188",
    dateTime: "2026-06-09T14:02:00",
    durationSeconds: 184,
    language: "Spanish",
    summary: "Leaking water heater, requested same-day service.",
    status: "Completed",
    collectedInfo: [
      { label: "Name", value: "Maria Gonzalez" },
      { label: "Phone", value: "(415) 555-0188" },
      { label: "Address", value: "47 Dolores St, San Francisco, CA" },
      { label: "Service", value: "Water heater repair" },
    ],
  },
  {
    id: "c2",
    callerName: "David Chen",
    callerPhone: "(650) 555-0119",
    dateTime: "2026-06-09T11:27:00",
    durationSeconds: 142,
    language: "Mandarin",
    summary: "Clogged kitchen drain. Requested a visit tomorrow morning.",
    status: "Completed",
    collectedInfo: [
      { label: "Name", value: "David Chen" },
      { label: "Phone", value: "(650) 555-0119" },
      { label: "Address", value: "210 Oak Ave, Daly City, CA" },
      { label: "Service", value: "Drain cleaning" },
    ],
  },
  {
    id: "c3",
    callerName: "Unknown Caller",
    callerPhone: "(415) 555-0204",
    dateTime: "2026-06-09T09:15:00",
    durationSeconds: 0,
    language: "English",
    summary: "Caller hung up before connecting.",
    status: "Missed",
    collectedInfo: [],
  },
  {
    id: "c4",
    callerName: "Priya Patel",
    callerPhone: "(408) 555-0173",
    dateTime: "2026-06-08T16:48:00",
    durationSeconds: 211,
    language: "Hindi",
    summary: "Asked about pricing for bathroom remodel plumbing. Provided estimate range.",
    status: "Completed",
    collectedInfo: [
      { label: "Name", value: "Priya Patel" },
      { label: "Phone", value: "(408) 555-0173" },
      { label: "Service", value: "Remodel estimate" },
    ],
  },
  {
    id: "c5",
    callerName: "James O'Brien",
    callerPhone: "(415) 555-0150",
    dateTime: "2026-06-08T13:05:00",
    durationSeconds: 96,
    language: "English",
    summary: "Burst pipe emergency. Dispatched a technician right away.",
    status: "Completed",
    collectedInfo: [
      { label: "Name", value: "James O'Brien" },
      { label: "Phone", value: "(415) 555-0150" },
      { label: "Address", value: "88 Pine St, San Francisco, CA" },
      { label: "Service", value: "Emergency pipe repair" },
    ],
  },
  {
    id: "c6",
    callerName: "Sophie Tremblay",
    callerPhone: "(415) 555-0166",
    dateTime: "2026-06-08T10:22:00",
    durationSeconds: 178,
    language: "French",
    summary: "Requested faucet replacement quote and availability next week.",
    status: "Completed",
    collectedInfo: [
      { label: "Name", value: "Sophie Tremblay" },
      { label: "Phone", value: "(415) 555-0166" },
      { label: "Address", value: "33 Hayes St, San Francisco, CA" },
      { label: "Service", value: "Faucet replacement" },
    ],
  },
  {
    id: "c7",
    callerName: "Robert Kim",
    callerPhone: "(510) 555-0192",
    dateTime: "2026-06-07T18:40:00",
    durationSeconds: 64,
    language: "Korean",
    summary: "General question about service area coverage in Oakland.",
    status: "Answered",
    collectedInfo: [
      { label: "Name", value: "Robert Kim" },
      { label: "Phone", value: "(510) 555-0192" },
    ],
  },
  {
    id: "c8",
    callerName: "Unknown Caller",
    callerPhone: "(415) 555-0211",
    dateTime: "2026-06-07T08:03:00",
    durationSeconds: 0,
    language: "English",
    summary: "Call failed to connect due to carrier error.",
    status: "Failed",
    collectedInfo: [],
  },
]

export type LinkedAccount = {
  type: "Google" | "Email" | "Phone"
  value: string
  primary: boolean
}

export const linkedAccounts: LinkedAccount[] = [
  { type: "Google", value: "owner@summitplumbing.com", primary: true },
  { type: "Email", value: "owner@summitplumbing.com", primary: false },
  { type: "Phone", value: "(415) 555-0142", primary: false },
]

// ---- Placeholder API functions ----

export async function signInWithGoogle() {
  console.log("[v0] signInWithGoogle()")
}

export async function sendMagicLink(email: string) {
  console.log("[v0] sendMagicLink()", email)
}

export async function sendSmsCode(phoneNumber: string) {
  console.log("[v0] sendSmsCode()", phoneNumber)
}

export async function verifySmsCode(phoneNumber: string, code: string) {
  console.log("[v0] verifySmsCode()", phoneNumber, code)
}

export async function changePlan(plan: Plan) {
  console.log("[v0] changePlan()", plan)
}

export async function updatePaymentMethod() {
  console.log("[v0] updatePaymentMethod()")
}

export async function openStripeCustomerPortal() {
  console.log("[v0] openStripeCustomerPortal()")
}

// ---- Formatting helpers ----

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
