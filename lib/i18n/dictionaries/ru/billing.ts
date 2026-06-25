const billing = {
  // Page header
  title: "Тариф и оплата",
  description: "Управляйте подпиской, использованием и платёжными данными.",

  // Usage summary
  currentPlan: "Текущий тариф",
  minutesPerMonth: "{minutes} мин/мес",
  billingCycle: "Расчётный цикл: {period}",
  minutesUsed: "Использовано минут",
  includedMinutes: "Включённые минуты",
  remaining: "Осталось",
  usedThisCycle: "Использовано {percent}% включённых минут за этот цикл",

  // Plan selection
  choosePlan: "Выберите свой тариф",
  currentPlanBadge: "Текущий тариф",
  perMonth: "/месяц",
  upgradeTo: "Перейти на {plan}",
  switchTo: "Переключиться на {plan}",
  noPlans: "Нет доступных тарифов.",

  // Payment / Stripe
  paymentSubscription: "Оплата и подписка",
  paymentDescription: "Управляйте способами оплаты и подпиской через платёжный портал Stripe.",
  openBillingPortal: "Открыть платёжный портал",

  // Billing history
  billingHistory: "История оплаты",
  noInvoices: "Пока нет счетов.",
  downloadInvoice: "Скачать счёт {number}",

  // Toasts
  changePlanFailed: "Не удалось изменить тариф",
  checkoutFailed: "Не удалось начать оформление оплаты",
  portalFailed: "Не удалось открыть платёжный портал",
  tryAgain: "Пожалуйста, повторите попытку.",
}

export default billing
