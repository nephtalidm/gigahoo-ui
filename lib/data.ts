import type { ConversationData, AccountData, PlanData } from "@/lib/api";

// ── Types ──

export type Plan = "Free" | "Starter" | "Business"

export type CallStatus = "Answered" | "Completed" | "Missed" | "Failed"

export type Conversation = {
  id: string
  callerName: string
  callerPhoneNumber: string
  dateTime: string
  durationSeconds: number
  language: string
  summary: string
  address: string
  isEmergency: boolean
  status: CallStatus
}

export type Account = {
  businessName: string
  category: string
  categoryId: number
  businessPhone: string
  email: string
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

export function mapApiConversation(c: ConversationData): Conversation {
  return {
    id: c.id,
    callerName: c.callerName ?? "Unknown Caller",
    callerPhoneNumber: c.callerPhoneNumber,
    // The API sends the UTC time without a "Z" (EF reads it as Unspecified kind); mark it UTC so
    // `new Date()` parses it as UTC and timezone conversion actually happens.
    dateTime: /(?:Z|[+-]\d{2}:\d{2})$/.test(c.dateTimeUtc) ? c.dateTimeUtc : c.dateTimeUtc + "Z",
    durationSeconds: c.durationSeconds,
    language: c.language,
    summary: c.summary ?? "",
    address: c.address ?? "",
    isEmergency: c.isEmergency ?? false,
    status: c.status as CallStatus,
  };
}

export function mapApiAccount(a: AccountData): Account {
  return {
    businessName: a.businessName,
    category: a.category,
    categoryId: a.categoryId,
    businessPhone: a.businessPhone,
    email: a.email,
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

// Maps each business category (its English name, used as the option value and
// id position) to a stable i18n key under the `categories` namespace.
export const businessCategoryKeys: Record<string, string> = {
  "Appliance Repair": "applianceRepair",
  "Cleaning": "cleaning",
  "Electrical": "electrical",
  "Garage Door Repair": "garageDoorRepair",
  "HVAC": "hvac",
  "Locksmith": "locksmith",
  "Plumbing": "plumbing",
  "Roofing": "roofing",
  "Other": "other",
}

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
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" },
  { name: "Mexico", code: "MX", dialCode: "+52", flag: "🇲🇽" },
  { name: "Afghanistan", code: "AF", dialCode: "+93", flag: "🇦🇫" },
  { name: "Albania", code: "AL", dialCode: "+355", flag: "🇦🇱" },
  { name: "Algeria", code: "DZ", dialCode: "+213", flag: "🇩🇿" },
  { name: "Andorra", code: "AD", dialCode: "+376", flag: "🇦🇩" },
  { name: "Angola", code: "AO", dialCode: "+244", flag: "🇦🇴" },
  { name: "Antigua and Barbuda", code: "AG", dialCode: "+1", flag: "🇦🇬" },
  { name: "Argentina", code: "AR", dialCode: "+54", flag: "🇦🇷" },
  { name: "Armenia", code: "AM", dialCode: "+374", flag: "🇦🇲" },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺" },
  { name: "Austria", code: "AT", dialCode: "+43", flag: "🇦🇹" },
  { name: "Azerbaijan", code: "AZ", dialCode: "+994", flag: "🇦🇿" },
  { name: "Bahamas", code: "BS", dialCode: "+1", flag: "🇧🇸" },
  { name: "Bahrain", code: "BH", dialCode: "+973", flag: "🇧🇭" },
  { name: "Bangladesh", code: "BD", dialCode: "+880", flag: "🇧🇩" },
  { name: "Barbados", code: "BB", dialCode: "+1", flag: "🇧🇧" },
  { name: "Belarus", code: "BY", dialCode: "+375", flag: "🇧🇾" },
  { name: "Belgium", code: "BE", dialCode: "+32", flag: "🇧🇪" },
  { name: "Belize", code: "BZ", dialCode: "+501", flag: "🇧🇿" },
  { name: "Benin", code: "BJ", dialCode: "+229", flag: "🇧🇯" },
  { name: "Bhutan", code: "BT", dialCode: "+975", flag: "🇧🇹" },
  { name: "Bolivia", code: "BO", dialCode: "+591", flag: "🇧🇴" },
  { name: "Bosnia and Herzegovina", code: "BA", dialCode: "+387", flag: "🇧🇦" },
  { name: "Botswana", code: "BW", dialCode: "+267", flag: "🇧🇼" },
  { name: "Brazil", code: "BR", dialCode: "+55", flag: "🇧🇷" },
  { name: "Brunei", code: "BN", dialCode: "+673", flag: "🇧🇳" },
  { name: "Bulgaria", code: "BG", dialCode: "+359", flag: "🇧🇬" },
  { name: "Burkina Faso", code: "BF", dialCode: "+226", flag: "🇧🇫" },
  { name: "Burundi", code: "BI", dialCode: "+257", flag: "🇧🇮" },
  { name: "Cambodia", code: "KH", dialCode: "+855", flag: "🇰🇭" },
  { name: "Cameroon", code: "CM", dialCode: "+237", flag: "🇨🇲" },
  { name: "Cape Verde", code: "CV", dialCode: "+238", flag: "🇨🇻" },
  { name: "Central African Republic", code: "CF", dialCode: "+236", flag: "🇨🇫" },
  { name: "Chad", code: "TD", dialCode: "+235", flag: "🇹🇩" },
  { name: "Chile", code: "CL", dialCode: "+56", flag: "🇨🇱" },
  { name: "China", code: "CN", dialCode: "+86", flag: "🇨🇳" },
  { name: "Colombia", code: "CO", dialCode: "+57", flag: "🇨🇴" },
  { name: "Comoros", code: "KM", dialCode: "+269", flag: "🇰🇲" },
  { name: "Congo (DRC)", code: "CD", dialCode: "+243", flag: "🇨🇩" },
  { name: "Congo (Republic)", code: "CG", dialCode: "+242", flag: "🇨🇬" },
  { name: "Costa Rica", code: "CR", dialCode: "+506", flag: "🇨🇷" },
  { name: "Cote d'Ivoire", code: "CI", dialCode: "+225", flag: "🇨🇮" },
  { name: "Croatia", code: "HR", dialCode: "+385", flag: "🇭🇷" },
  { name: "Cuba", code: "CU", dialCode: "+53", flag: "🇨🇺" },
  { name: "Cyprus", code: "CY", dialCode: "+357", flag: "🇨🇾" },
  { name: "Czechia", code: "CZ", dialCode: "+420", flag: "🇨🇿" },
  { name: "Denmark", code: "DK", dialCode: "+45", flag: "🇩🇰" },
  { name: "Djibouti", code: "DJ", dialCode: "+253", flag: "🇩🇯" },
  { name: "Dominica", code: "DM", dialCode: "+1", flag: "🇩🇲" },
  { name: "Dominican Republic", code: "DO", dialCode: "+1", flag: "🇩🇴" },
  { name: "Ecuador", code: "EC", dialCode: "+593", flag: "🇪🇨" },
  { name: "Egypt", code: "EG", dialCode: "+20", flag: "🇪🇬" },
  { name: "El Salvador", code: "SV", dialCode: "+503", flag: "🇸🇻" },
  { name: "Equatorial Guinea", code: "GQ", dialCode: "+240", flag: "🇬🇶" },
  { name: "Eritrea", code: "ER", dialCode: "+291", flag: "🇪🇷" },
  { name: "Estonia", code: "EE", dialCode: "+372", flag: "🇪🇪" },
  { name: "Eswatini", code: "SZ", dialCode: "+268", flag: "🇸🇿" },
  { name: "Ethiopia", code: "ET", dialCode: "+251", flag: "🇪🇹" },
  { name: "Fiji", code: "FJ", dialCode: "+679", flag: "🇫🇯" },
  { name: "Finland", code: "FI", dialCode: "+358", flag: "🇫🇮" },
  { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷" },
  { name: "Gabon", code: "GA", dialCode: "+241", flag: "🇬🇦" },
  { name: "Gambia", code: "GM", dialCode: "+220", flag: "🇬🇲" },
  { name: "Georgia", code: "GE", dialCode: "+995", flag: "🇬🇪" },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪" },
  { name: "Ghana", code: "GH", dialCode: "+233", flag: "🇬🇭" },
  { name: "Greece", code: "GR", dialCode: "+30", flag: "🇬🇷" },
  { name: "Grenada", code: "GD", dialCode: "+1", flag: "🇬🇩" },
  { name: "Guatemala", code: "GT", dialCode: "+502", flag: "🇬🇹" },
  { name: "Guinea", code: "GN", dialCode: "+224", flag: "🇬🇳" },
  { name: "Guinea-Bissau", code: "GW", dialCode: "+245", flag: "🇬🇼" },
  { name: "Guyana", code: "GY", dialCode: "+592", flag: "🇬🇾" },
  { name: "Haiti", code: "HT", dialCode: "+509", flag: "🇭🇹" },
  { name: "Honduras", code: "HN", dialCode: "+504", flag: "🇭🇳" },
  { name: "Hungary", code: "HU", dialCode: "+36", flag: "🇭🇺" },
  { name: "Iceland", code: "IS", dialCode: "+354", flag: "🇮🇸" },
  { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳" },
  { name: "Indonesia", code: "ID", dialCode: "+62", flag: "🇮🇩" },
  { name: "Iran", code: "IR", dialCode: "+98", flag: "🇮🇷" },
  { name: "Iraq", code: "IQ", dialCode: "+964", flag: "🇮🇶" },
  { name: "Ireland", code: "IE", dialCode: "+353", flag: "🇮🇪" },
  { name: "Israel", code: "IL", dialCode: "+972", flag: "🇮🇱" },
  { name: "Italy", code: "IT", dialCode: "+39", flag: "🇮🇹" },
  { name: "Jamaica", code: "JM", dialCode: "+1", flag: "🇯🇲" },
  { name: "Japan", code: "JP", dialCode: "+81", flag: "🇯🇵" },
  { name: "Jordan", code: "JO", dialCode: "+962", flag: "🇯🇴" },
  { name: "Kazakhstan", code: "KZ", dialCode: "+7", flag: "🇰🇿" },
  { name: "Kenya", code: "KE", dialCode: "+254", flag: "🇰🇪" },
  { name: "Kiribati", code: "KI", dialCode: "+686", flag: "🇰🇮" },
  { name: "Kosovo", code: "XK", dialCode: "+383", flag: "🇽🇰" },
  { name: "Kuwait", code: "KW", dialCode: "+965", flag: "🇰🇼" },
  { name: "Kyrgyzstan", code: "KG", dialCode: "+996", flag: "🇰🇬" },
  { name: "Laos", code: "LA", dialCode: "+856", flag: "🇱🇦" },
  { name: "Latvia", code: "LV", dialCode: "+371", flag: "🇱🇻" },
  { name: "Lebanon", code: "LB", dialCode: "+961", flag: "🇱🇧" },
  { name: "Lesotho", code: "LS", dialCode: "+266", flag: "🇱🇸" },
  { name: "Liberia", code: "LR", dialCode: "+231", flag: "🇱🇷" },
  { name: "Libya", code: "LY", dialCode: "+218", flag: "🇱🇾" },
  { name: "Liechtenstein", code: "LI", dialCode: "+423", flag: "🇱🇮" },
  { name: "Lithuania", code: "LT", dialCode: "+370", flag: "🇱🇹" },
  { name: "Luxembourg", code: "LU", dialCode: "+352", flag: "🇱🇺" },
  { name: "Madagascar", code: "MG", dialCode: "+261", flag: "🇲🇬" },
  { name: "Malawi", code: "MW", dialCode: "+265", flag: "🇲🇼" },
  { name: "Malaysia", code: "MY", dialCode: "+60", flag: "🇲🇾" },
  { name: "Maldives", code: "MV", dialCode: "+960", flag: "🇲🇻" },
  { name: "Mali", code: "ML", dialCode: "+223", flag: "🇲🇱" },
  { name: "Malta", code: "MT", dialCode: "+356", flag: "🇲🇹" },
  { name: "Marshall Islands", code: "MH", dialCode: "+692", flag: "🇲🇭" },
  { name: "Mauritania", code: "MR", dialCode: "+222", flag: "🇲🇷" },
  { name: "Mauritius", code: "MU", dialCode: "+230", flag: "🇲🇺" },
  { name: "Micronesia", code: "FM", dialCode: "+691", flag: "🇫🇲" },
  { name: "Moldova", code: "MD", dialCode: "+373", flag: "🇲🇩" },
  { name: "Monaco", code: "MC", dialCode: "+377", flag: "🇲🇨" },
  { name: "Mongolia", code: "MN", dialCode: "+976", flag: "🇲🇳" },
  { name: "Montenegro", code: "ME", dialCode: "+382", flag: "🇲🇪" },
  { name: "Morocco", code: "MA", dialCode: "+212", flag: "🇲🇦" },
  { name: "Mozambique", code: "MZ", dialCode: "+258", flag: "🇲🇿" },
  { name: "Myanmar", code: "MM", dialCode: "+95", flag: "🇲🇲" },
  { name: "Namibia", code: "NA", dialCode: "+264", flag: "🇳🇦" },
  { name: "Nauru", code: "NR", dialCode: "+674", flag: "🇳🇷" },
  { name: "Nepal", code: "NP", dialCode: "+977", flag: "🇳🇵" },
  { name: "Netherlands", code: "NL", dialCode: "+31", flag: "🇳🇱" },
  { name: "New Zealand", code: "NZ", dialCode: "+64", flag: "🇳🇿" },
  { name: "Nicaragua", code: "NI", dialCode: "+505", flag: "🇳🇮" },
  { name: "Niger", code: "NE", dialCode: "+227", flag: "🇳🇪" },
  { name: "Nigeria", code: "NG", dialCode: "+234", flag: "🇳🇬" },
  { name: "North Korea", code: "KP", dialCode: "+850", flag: "🇰🇵" },
  { name: "North Macedonia", code: "MK", dialCode: "+389", flag: "🇲🇰" },
  { name: "Norway", code: "NO", dialCode: "+47", flag: "🇳🇴" },
  { name: "Oman", code: "OM", dialCode: "+968", flag: "🇴🇲" },
  { name: "Pakistan", code: "PK", dialCode: "+92", flag: "🇵🇰" },
  { name: "Palau", code: "PW", dialCode: "+680", flag: "🇵🇼" },
  { name: "Palestine", code: "PS", dialCode: "+970", flag: "🇵🇸" },
  { name: "Panama", code: "PA", dialCode: "+507", flag: "🇵🇦" },
  { name: "Papua New Guinea", code: "PG", dialCode: "+675", flag: "🇵🇬" },
  { name: "Paraguay", code: "PY", dialCode: "+595", flag: "🇵🇾" },
  { name: "Peru", code: "PE", dialCode: "+51", flag: "🇵🇪" },
  { name: "Philippines", code: "PH", dialCode: "+63", flag: "🇵🇭" },
  { name: "Poland", code: "PL", dialCode: "+48", flag: "🇵🇱" },
  { name: "Portugal", code: "PT", dialCode: "+351", flag: "🇵🇹" },
  { name: "Qatar", code: "QA", dialCode: "+974", flag: "🇶🇦" },
  { name: "Romania", code: "RO", dialCode: "+40", flag: "🇷🇴" },
  { name: "Russia", code: "RU", dialCode: "+7", flag: "🇷🇺" },
  { name: "Rwanda", code: "RW", dialCode: "+250", flag: "🇷🇼" },
  { name: "Saint Kitts and Nevis", code: "KN", dialCode: "+1", flag: "🇰🇳" },
  { name: "Saint Lucia", code: "LC", dialCode: "+1", flag: "🇱🇨" },
  { name: "Saint Vincent and the Grenadines", code: "VC", dialCode: "+1", flag: "🇻🇨" },
  { name: "Samoa", code: "WS", dialCode: "+685", flag: "🇼🇸" },
  { name: "San Marino", code: "SM", dialCode: "+378", flag: "🇸🇲" },
  { name: "Sao Tome and Principe", code: "ST", dialCode: "+239", flag: "🇸🇹" },
  { name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "🇸🇦" },
  { name: "Senegal", code: "SN", dialCode: "+221", flag: "🇸🇳" },
  { name: "Serbia", code: "RS", dialCode: "+381", flag: "🇷🇸" },
  { name: "Seychelles", code: "SC", dialCode: "+248", flag: "🇸🇨" },
  { name: "Sierra Leone", code: "SL", dialCode: "+232", flag: "🇸🇱" },
  { name: "Singapore", code: "SG", dialCode: "+65", flag: "🇸🇬" },
  { name: "Slovakia", code: "SK", dialCode: "+421", flag: "🇸🇰" },
  { name: "Slovenia", code: "SI", dialCode: "+386", flag: "🇸🇮" },
  { name: "Solomon Islands", code: "SB", dialCode: "+677", flag: "🇸🇧" },
  { name: "Somalia", code: "SO", dialCode: "+252", flag: "🇸🇴" },
  { name: "South Africa", code: "ZA", dialCode: "+27", flag: "🇿🇦" },
  { name: "South Korea", code: "KR", dialCode: "+82", flag: "🇰🇷" },
  { name: "South Sudan", code: "SS", dialCode: "+211", flag: "🇸🇸" },
  { name: "Spain", code: "ES", dialCode: "+34", flag: "🇪🇸" },
  { name: "Sri Lanka", code: "LK", dialCode: "+94", flag: "🇱🇰" },
  { name: "Sudan", code: "SD", dialCode: "+249", flag: "🇸🇩" },
  { name: "Suriname", code: "SR", dialCode: "+597", flag: "🇸🇷" },
  { name: "Sweden", code: "SE", dialCode: "+46", flag: "🇸🇪" },
  { name: "Switzerland", code: "CH", dialCode: "+41", flag: "🇨🇭" },
  { name: "Syria", code: "SY", dialCode: "+963", flag: "🇸🇾" },
  { name: "Taiwan", code: "TW", dialCode: "+886", flag: "🇹🇼" },
  { name: "Tajikistan", code: "TJ", dialCode: "+992", flag: "🇹🇯" },
  { name: "Tanzania", code: "TZ", dialCode: "+255", flag: "🇹🇿" },
  { name: "Thailand", code: "TH", dialCode: "+66", flag: "🇹🇭" },
  { name: "Timor-Leste", code: "TL", dialCode: "+670", flag: "🇹🇱" },
  { name: "Togo", code: "TG", dialCode: "+228", flag: "🇹🇬" },
  { name: "Tonga", code: "TO", dialCode: "+676", flag: "🇹🇴" },
  { name: "Trinidad and Tobago", code: "TT", dialCode: "+1", flag: "🇹🇹" },
  { name: "Tunisia", code: "TN", dialCode: "+216", flag: "🇹🇳" },
  { name: "Turkey", code: "TR", dialCode: "+90", flag: "🇹🇷" },
  { name: "Turkmenistan", code: "TM", dialCode: "+993", flag: "🇹🇲" },
  { name: "Tuvalu", code: "TV", dialCode: "+688", flag: "🇹🇻" },
  { name: "Uganda", code: "UG", dialCode: "+256", flag: "🇺🇬" },
  { name: "Ukraine", code: "UA", dialCode: "+380", flag: "🇺🇦" },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "🇦🇪" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧" },
  { name: "Uruguay", code: "UY", dialCode: "+598", flag: "🇺🇾" },
  { name: "Uzbekistan", code: "UZ", dialCode: "+998", flag: "🇺🇿" },
  { name: "Vanuatu", code: "VU", dialCode: "+678", flag: "🇻🇺" },
  { name: "Vatican City", code: "VA", dialCode: "+379", flag: "🇻🇦" },
  { name: "Venezuela", code: "VE", dialCode: "+58", flag: "🇻🇪" },
  { name: "Vietnam", code: "VN", dialCode: "+84", flag: "🇻🇳" },
  { name: "Yemen", code: "YE", dialCode: "+967", flag: "🇾🇪" },
  { name: "Zambia", code: "ZM", dialCode: "+260", flag: "🇿🇲" },
  { name: "Zimbabwe", code: "ZW", dialCode: "+263", flag: "🇿🇼" },
]

// Canadian NANP area codes (under +1). Any +1 area code NOT in this set is
// treated as US. Used to disambiguate US vs CA at signup, since both share the
// +1 country code and only the area code (first 3 digits) tells them apart.
export const CANADIAN_AREA_CODES = new Set([
  "204", "226", "236", "249", "250", "263", "289", "306", "343", "354", "365",
  "367", "368", "382", "387", "403", "416", "418", "431", "437", "438", "450",
  "468", "474", "506", "514", "519", "548", "579", "581", "584", "587", "604",
  "613", "639", "647", "672", "683", "705", "709", "742", "753", "778", "780",
  "782", "807", "819", "825", "867", "873", "879", "902", "905",
])

// Validate that a +1 (NANP) phone's area code matches the selected country.
// Only US/CA are ambiguous (both +1); every other country has a distinct dial
// code, so this returns true (no constraint) for them. For US the area code must
// NOT be Canadian; for CA it must be Canadian. Returns true when the number is
// too short to have a full 3-digit area code (length validation handles that).
export function areaCodeMatchesCountry(phoneDigits: string, countryCode: string): boolean {
  if (countryCode !== "US" && countryCode !== "CA") return true
  // Drop a leading "1" country-code digit if present (11-digit NANP form).
  let digits = phoneDigits.replace(/\D/g, "")
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1)
  if (digits.length < 3) return true
  const areaCode = digits.slice(0, 3)
  const isCanadian = CANADIAN_AREA_CODES.has(areaCode)
  return countryCode === "CA" ? isCanadian : !isCanadian
}

// Combine a country code (e.g. "US") and a local number into an E.164 string
// (e.g. "+14165551234") for telephony APIs like Twilio.
export function toE164(countryCode: string, number: string): string {
  const dialCode = countries.find((c) => c.code === countryCode)?.dialCode ?? "+1"
  const digits = number.replace(/\D/g, "")
  return `${dialCode}${digits}`
}

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
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

// Format a NANP number as "(XXX) XXX-XXXX"; anything else is returned unchanged.
export function formatPhone(raw: string) {
  if (!raw) return "—"
  let d = raw.replace(/\D/g, "")
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1)
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
  return raw
}

export function formatDateTime(iso: string, timeZone?: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...(timeZone ? { timeZone } : {}),
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

// Display formatting for phone numbers everywhere in the product: "+1 (778) 392-3021".
// NANP numbers get the full pretty form; other countries render as "+<dial> <rest>".
export function formatPhoneDisplay(phone: string | null | undefined): string {
  const p = (phone ?? "").trim()
  if (!p) return ""
  const digits = p.replace(/\D/g, "")
  if (digits.length === 11 && digits.startsWith("1")) return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  if (digits.length === 10) return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  const match = [...countries]
    .sort((a, b) => b.dialCode.length - a.dialCode.length)
    .find((c) => digits.startsWith(c.dialCode.replace(/\D/g, "")))
  if (match) return `${match.dialCode} ${digits.slice(match.dialCode.replace(/\D/g, "").length)}`
  return p.startsWith("+") ? p : `+${digits}`
}

// Split a stored E.164 number into a picker country + local digits for editing.
// US/CA share +1, so the NANP area code decides between them.
export function splitE164(phone: string | null | undefined): { countryCode: string; local: string } {
  const p = (phone ?? "").trim()
  const digits = p.replace(/\D/g, "")
  if (!digits) return { countryCode: "US", local: "" }
  if (digits.length === 11 && digits.startsWith("1")) {
    const local = digits.slice(1)
    return { countryCode: areaCodeMatchesCountry(local, "CA") ? "CA" : "US", local }
  }
  if (digits.length === 10) {
    return { countryCode: areaCodeMatchesCountry(digits, "CA") ? "CA" : "US", local: digits }
  }
  const match = [...countries]
    .sort((a, b) => b.dialCode.length - a.dialCode.length)
    .find((c) => digits.startsWith(c.dialCode.replace(/\D/g, "")))
  if (match) return { countryCode: match.code, local: digits.slice(match.dialCode.replace(/\D/g, "").length) }
  return { countryCode: "US", local: digits }
}
