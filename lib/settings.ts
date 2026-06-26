// App-wide settings — centralize values that change as we grow.

// Countries we currently serve (ISO-2). Restricts the phone/address country
// pickers across signup, auth, and settings. Add a code here to support a new
// country (and add its PlanPrice rows + Country.Currency on the API side).
export const SUPPORTED_COUNTRY_CODES: string[] = ["US", "CA"]

// Markets shown in the country pickers but not yet open for signup (ISO-2).
// They appear as options (tied to a domain + language) so visitors can explore,
// but signup/pricing CTAs are disabled with a "coming soon" label until launch.
export const COMING_SOON_COUNTRY_CODES: string[] = ["MX"]
