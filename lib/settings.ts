// App-wide settings — centralize values that change as we grow.

// Countries we currently serve (ISO-2). Restricts the phone/address country
// pickers across signup, auth, and settings. Add a code here to support a new
// country (and add its PlanPrice rows + Country.Currency on the API side).
export const SUPPORTED_COUNTRY_CODES: string[] = ["US", "CA"]
