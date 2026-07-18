const billing = {
  // Page header
  title: "Plano at Pagbabayad",
  description: "Pamahalaan ang iyong subscription, paggamit, at mga detalye ng pagbabayad.",

  // Usage summary
  currentPlan: "Kasalukuyang Plano",
  minutesPerMonth: "{minutes} min/buwan",
  billingCycle: "Cycle ng pagbabayad: {period}",
  minutesUsed: "Mga Minutong Nagamit",
  includedMinutes: "Kasamang Minuto",
  remaining: "Natitira",
  usedThisCycle: "{percent}% ng kasamang minuto ang nagamit sa cycle na ito",

  // Plan selection
  choosePlan: "Piliin ang iyong plano",
  currentPlanBadge: "Kasalukuyang plano",
  perMonth: "/buwan",
  upgradeTo: "Mag-upgrade sa {plan}",
  switchTo: "Lumipat sa {plan}",
  noPlans: "Walang available na plano.",

  // Payment / Stripe
  paymentSubscription: "Pagbabayad at Subscription",
  paymentDescription: "Pamahalaan ang iyong mga paraan ng pagbabayad at subscription sa pamamagitan ng Stripe Billing Portal.",
  managePaymentMethods: "Pamahalaan ang mga paraan ng pagbabayad",

  // Billing history
  billingHistory: "Kasaysayan ng Pagbabayad",
  noInvoices: "Wala pang mga invoice.",
  downloadInvoice: "I-download ang invoice {number}",

  // Toasts
  changePlanFailed: "Nabigong baguhin ang plano",
  checkoutFailed: "Nabigong simulan ang checkout",
  tryAgain: "Pakisubukan muli.",
  // Payment methods (embedded Stripe Elements)
  paymentMethodsTitle: "Pagbabayad",
  paymentMethodsDescription: "Magdagdag at pamahalaan ang mga card na ginagamit para bayaran ang iyong subscription.",
  addPaymentMethod: "Magdagdag ng paraan ng pagbabayad",
  addPaymentMethodHint: "Ligtas na magdagdag ng bagong card. Ang iyong mga detalye ay pinangangasiwaan ng aming payment provider.",
  save: "I-save ang card",
  cancel: "Kanselahin",
  remove: "Alisin",
  defaultCard: "Default",
  makeDefault: "Gawing default",
  removeConfirm: "Alisin ang paraan ng pagbabayad na ito?",
  noPaymentMethods: "Wala pang naka-save na paraan ng pagbabayad.",
  cardSaved: "Na-save ang card",
  cardExpires: "Mag-e-expire {date}",
  cardError: "Hindi ma-save ang iyong card. Pakisubukang muli.",
  pay: "Magbayad",
  completeUpgrade: "Kumpletuhin ang pag-upgrade ng plano",
  confirmUpgradeTitle: "Kumpirmahin ang upgrade",
  confirmUpgradeText: "I-upgrade sa {plan} sa {price}/buwan? Sisingilin ang iyong {brand} card na nagtatapos sa {last4}.",
  confirmCharge: "Kumpirmahin at magbayad",
  addCardFailed: "Hindi masimulan ang pagdaragdag ng card. Pakisubukang muli.",
  providerUnsupported: "Hindi pa sinusuportahan ang payment provider na ito.",
}

export default billing
