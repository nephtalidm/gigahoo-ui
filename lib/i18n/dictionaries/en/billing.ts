const billing = {
  // Page header
  title: "Plan & Billing",
  description: "Manage your subscription, usage, and payment details.",

  // Usage summary
  currentPlan: "Current Plan",
  minutesPerMonth: "{minutes} min/mo",
  billingCycle: "Billing cycle: {period}",
  minutesUsed: "Minutes Used",
  includedMinutes: "Included Minutes",
  remaining: "Remaining",
  usedThisCycle: "{percent}% of included minutes used this cycle",

  // Plan selection
  choosePlan: "Choose your plan",
  currentPlanBadge: "Current plan",
  perMonth: "/month",
  upgradeTo: "Upgrade to {plan}",
  switchTo: "Switch to {plan}",
  noPlans: "No plans available.",

  // Payment / Stripe
  paymentSubscription: "Payment & Subscription",
  paymentDescription: "Manage your payment methods and subscription through the Stripe Billing Portal.",
  openBillingPortal: "Open Billing Portal",

  // Billing history
  billingHistory: "Billing History",
  noInvoices: "No invoices yet.",
  downloadInvoice: "Download invoice {number}",

  // Toasts
  changePlanFailed: "Failed to change plan",
  checkoutFailed: "Failed to start checkout",
  portalFailed: "Failed to open billing portal",
  tryAgain: "Please try again.",
}

export default billing
