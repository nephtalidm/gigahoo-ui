// Industry landing pages: URL slug ↔ Gigahoo business category. The category
// drives everything on the page (localized name via categories.*, and the demo
// popup preselection), so adding an industry here is the whole job.
export const INDUSTRY_CATEGORIES: Record<string, string> = {
  plumbing: "Plumbing",
  hvac: "HVAC",
  electrical: "Electrical",
  roofing: "Roofing",
  locksmith: "Locksmith",
  "garage-door": "Garage Door Repair",
}

export const INDUSTRY_SLUGS = Object.keys(INDUSTRY_CATEGORIES)
