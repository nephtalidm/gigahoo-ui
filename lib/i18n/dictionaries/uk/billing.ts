const billing = {
  // Page header
  title: "Тариф і оплата",
  description: "Керуйте підпискою, використанням і платіжними даними.",

  // Usage summary
  currentPlan: "Поточний тариф",
  minutesPerMonth: "{minutes} хв/міс",
  billingCycle: "Розрахунковий цикл: {period}",
  minutesUsed: "Використано хвилин",
  includedMinutes: "Включені хвилини",
  remaining: "Залишилось",
  usedThisCycle: "{percent}% включених хвилин використано за цей цикл",

  // Plan selection
  choosePlan: "Виберіть свій тариф",
  currentPlanBadge: "Поточний тариф",
  perMonth: "/місяць",
  upgradeTo: "Перейти на {plan}",
  switchTo: "Перейти на {plan}",
  noPlans: "Немає доступних тарифів.",

  // Payment / Stripe
  paymentSubscription: "Оплата та підписка",
  paymentDescription: "Керуйте способами оплати та підпискою через платіжний портал Stripe.",
  openBillingPortal: "Відкрити платіжний портал",

  // Billing history
  billingHistory: "Історія платежів",
  noInvoices: "Рахунків поки немає.",
  downloadInvoice: "Завантажити рахунок {number}",

  // Toasts
  changePlanFailed: "Не вдалося змінити тариф",
  checkoutFailed: "Не вдалося розпочати оплату",
  portalFailed: "Не вдалося відкрити платіжний портал",
  tryAgain: "Будь ласка, спробуйте ще раз.",
}

export default billing
