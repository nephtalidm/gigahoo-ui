const dashboard = {
  // Sidebar nav
  navOverview: "Огляд",
  navCallHistory: "Історія дзвінків",
  navOptionalFeatures: "Додаткові можливості",
  navPlanBilling: "Тариф",
  navBilling: "Оплата",
  navNotifications: "Сповіщення",
  navVoiceAgent: "ШІ голосовий агент",
  navSettings: "Загальні налаштування",

  // Voice Agent page
  voiceAgentTitle: "Голосовий ШІ-агент",
  voiceAgentDescription: "Налаштуйте, як ШІ-секретар вітає тих, хто телефонує, і як звучить його голос.",
  greetingLabel: "Привітання",
  greetingHint: "Що каже ШІ, відповідаючи на дзвінок. Залиште порожнім, щоб використовувати привітання за замовчуванням.",
  voiceLabel: "Голос агента",
  voiceHint: "Виберіть голос, яким говорить ваш ШІ-секретар. Прослухайте зразок кожного голосу.",
  playSample: "Прослухати зразок",
  voiceSaved: "Збережено",
  voiceCherry: "Cherry (теплий жіночий)",
  voiceEthan: "Ethan (дружній чоловічий)",
  voiceChelsie: "Chelsie (чіткий жіночий)",
  voiceSerena: "Serena (спокійний жіночий)",
  save: "Зберегти",
  navigation: "Навігація",
  openMenu: "Відкрити меню",
  signOut: "Вийти",
  loading: "Завантаження…",
  planLabel: "Тариф {plan}",

  // Idle session timeout
  idleTitle: "Ви ще тут?",
  idleDescription: "Ви певний час були неактивні. З міркувань безпеки вас буде автоматично виведено із системи після завершення таймера.",
  idleStay: "Залишитися в системі",
  idleLogoutNow: "Вийти зараз",

  // Overview page
  overviewTitle: "Огляд",
  overviewWelcome: "З поверненням!",
  loadFailed: "Не вдалося завантажити панель керування.",
  tryAgain: "Спробувати ще раз",
  currentPlan: "Поточний тариф",
  minutesPerMonth: "{minutes} хв/міс",
  minutesUsedThisPeriod: "{used} із {total} хвилин використано за цей період",
  upgradeTo: "Перейти на {plan}",
  managePlan: "Керувати тарифом",
  recentCalls: "Останні дзвінки",
  viewAll: "Переглянути всі",
  noCalls: "Дзвінків поки немає. Ваш AI-секретар готовий до роботи.",

  // Metric cards
  callsAnswered: "Відповіли на дзвінки",
  avgCallDuration: "Середня тривалість дзвінка",
  minutesRemaining: "Залишилось хвилин",
  secondsSuffix: "с",

  // Minute usage widget
  minuteUsage: "Використання хвилин",
  billingPeriod: "Розрахунковий період: {period}",
  statusOverLimit: "Понад ліміт",
  statusNearLimit: "Близько до ліміту",
  statusHealthy: "Нормальне використання",
  minutesUsedLabel: "Використано хвилин",
  ofTotal: "із {total}",
  statUsed: "Використано",
  statRemaining: "Залишилось",
  statUsedPct: "Використано %",
  includedMinutesRemaining: "{remaining} із {total} включених хвилин залишилось",
  changePlan: "Змінити тариф",

  // Upgrade card
  upgradeHeading: "Перейдіть на {plan}, щоб увімкнути {feature}",
  upgradeSubtext: "Ця можливість доступна на тарифі {plan} і вище.",

  // Status badges
  statusAnswered: "Відповіли",
  statusCompleted: "Завершено",
  statusMissed: "Пропущено",
  statusFailed: "Помилка",
}

export default dashboard
