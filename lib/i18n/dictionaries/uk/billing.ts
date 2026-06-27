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
  // Payment methods (embedded Stripe Elements)
  paymentMethodsTitle: "Способи оплати",
  paymentMethodsDescription: "Додавайте та керуйте картками, які використовуються для оплати підписки.",
  addPaymentMethod: "Додати спосіб оплати",
  addPaymentMethodHint: "Безпечно додайте нову картку. Ваші дані обробляє наш платіжний провайдер.",
  save: "Зберегти картку",
  cancel: "Скасувати",
  remove: "Видалити",
  removeConfirm: "Видалити цей спосіб оплати?",
  noPaymentMethods: "Способи оплати ще не збережено.",
  cardSaved: "Картку збережено",
  cardExpires: "Діє до {date}",
  cardError: "Не вдалося зберегти вашу картку. Будь ласка, спробуйте ще раз.",
  addCardFailed: "Не вдалося розпочати додавання картки. Будь ласка, спробуйте ще раз.",
  providerUnsupported: "Цей платіжний провайдер поки що не підтримується.",
}

export default billing
