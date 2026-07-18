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

  // Billing history
  billingHistory: "История оплаты",
  noInvoices: "Пока нет счетов.",
  downloadInvoice: "Скачать счёт {number}",

  // Toasts
  changePlanFailed: "Не удалось изменить тариф",
  checkoutFailed: "Не удалось начать оформление оплаты",
  tryAgain: "Пожалуйста, повторите попытку.",
  // Payment methods (embedded Stripe Elements)
  paymentMethodsTitle: "Оплата",
  paymentMethodsDescription: "Добавляйте и управляйте картами, которые используются для оплаты подписки.",
  addPaymentMethod: "Добавить способ оплаты",
  addPaymentMethodHint: "Безопасно добавьте новую карту. Ваши данные обрабатывает наш платёжный провайдер.",
  save: "Сохранить карту",
  cancel: "Отмена",
  remove: "Удалить",
  defaultCard: "Основная",
  makeDefault: "Сделать основной",
  removeConfirm: "Удалить этот способ оплаты?",
  noPaymentMethods: "Способы оплаты ещё не сохранены.",
  cardSaved: "Карта сохранена",
  cardExpires: "Действует до {date}",
  cardError: "Не удалось сохранить карту. Пожалуйста, попробуйте ещё раз.",
  pay: "Оплатить",
  completeUpgradeTo: "Завершите переход на тариф {plan}",
  completeSubscribeTo: "Завершите оформление подписки на тариф {plan}",
  confirmSubscribeTitle: "Подтвердите подписку",
  confirmSubscribeText: "Оформить подписку на {plan} за {price}/мес.? Будет списано с карты {brand}, оканчивающейся на {last4}.",
  confirmUpgradeTitle: "Подтвердите переход",
  confirmUpgradeText: "Перейти на {plan} за {price}/мес.? Будет списано с карты {brand}, оканчивающейся на {last4}.",
  confirmCharge: "Подтвердить и оплатить",
  addCardFailed: "Не удалось начать добавление карты. Пожалуйста, попробуйте ещё раз.",
  providerUnsupported: "Этот платёжный провайдер пока не поддерживается.",
}

export default billing
