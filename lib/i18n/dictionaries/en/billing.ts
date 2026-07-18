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

  // Billing history
  billingHistory: "Billing History",
  noInvoices: "No invoices yet.",
  downloadInvoice: "Download invoice {number}",

  // Toasts
  changePlanFailed: "Failed to change plan",
  checkoutFailed: "Failed to start checkout",
  tryAgain: "Please try again.",
  // Payment methods (embedded Stripe Elements)
  paymentMethodsTitle: "Billing",
  paymentMethodsDescription: "Add and manage the cards used to pay for your subscription.",
  addPaymentMethod: "Add payment method",
  addPaymentMethodHint: "Securely add a new card. Your details are handled by our payment provider.",
  save: "Save card",
  cancel: "Cancel",
  remove: "Remove",
  defaultCard: "Default",
  makeDefault: "Make default",
  removeConfirm: "Remove this payment method?",
  noPaymentMethods: "No payment methods saved yet.",
  cardSaved: "Card saved",
  cardExpires: "Expires {date}",
  cardError: "Could not save your card. Please try again.",
  pay: "Pay",
  completeUpgradeTo: "Complete your upgrade to {plan}",
  completeSubscribeTo: "Complete your subscription to {plan}",
  confirmSubscribeTitle: "Confirm subscription",
  confirmSubscribeText: "Subscribe to {plan} for {price}/month? Your {brand} card ending in {last4} will be charged.",
  confirmUpgradeTitle: "Confirm upgrade",
  confirmUpgradeText: "Upgrade to {plan} for {price}/month? Your {brand} card ending in {last4} will be charged.",
  confirmCharge: "Confirm and pay",
  addCardFailed: "Could not start adding a card. Please try again.",
  providerUnsupported: "This payment provider isn't supported yet.",
}

export default billing
