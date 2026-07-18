const billing = {
  // Page header
  title: "ਪਲਾਨ ਅਤੇ ਬਿਲਿੰਗ",
  description: "ਆਪਣੀ ਸਬਸਕ੍ਰਿਪਸ਼ਨ, ਵਰਤੋਂ ਅਤੇ ਭੁਗਤਾਨ ਦੇ ਵੇਰਵਿਆਂ ਦਾ ਪ੍ਰਬੰਧ ਕਰੋ।",

  // Usage summary
  currentPlan: "ਮੌਜੂਦਾ ਪਲਾਨ",
  minutesPerMonth: "{minutes} ਮਿੰਟ/ਮਹੀਨਾ",
  billingCycle: "ਬਿਲਿੰਗ ਚੱਕਰ: {period}",
  minutesUsed: "ਵਰਤੇ ਗਏ ਮਿੰਟ",
  includedMinutes: "ਸ਼ਾਮਲ ਮਿੰਟ",
  remaining: "ਬਾਕੀ",
  usedThisCycle: "ਇਸ ਚੱਕਰ ਵਿੱਚ ਸ਼ਾਮਲ ਮਿੰਟਾਂ ਦਾ {percent}% ਵਰਤਿਆ ਗਿਆ",

  // Plan selection
  choosePlan: "ਆਪਣਾ ਪਲਾਨ ਚੁਣੋ",
  currentPlanBadge: "ਮੌਜੂਦਾ ਪਲਾਨ",
  perMonth: "/ਮਹੀਨਾ",
  upgradeTo: "{plan} ਵਿੱਚ ਅੱਪਗ੍ਰੇਡ ਕਰੋ",
  switchTo: "{plan} 'ਤੇ ਬਦਲੋ",
  noPlans: "ਕੋਈ ਪਲਾਨ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।",

  // Payment / Stripe
  paymentSubscription: "ਭੁਗਤਾਨ ਅਤੇ ਸਬਸਕ੍ਰਿਪਸ਼ਨ",
  paymentDescription: "Stripe ਬਿਲਿੰਗ ਪੋਰਟਲ ਰਾਹੀਂ ਆਪਣੇ ਭੁਗਤਾਨ ਤਰੀਕਿਆਂ ਅਤੇ ਸਬਸਕ੍ਰਿਪਸ਼ਨ ਦਾ ਪ੍ਰਬੰਧ ਕਰੋ।",
  managePaymentMethods: "ਭੁਗਤਾਨ ਵਿਧੀਆਂ ਪ੍ਰਬੰਧਿਤ ਕਰੋ",

  // Billing history
  billingHistory: "ਬਿਲਿੰਗ ਇਤਿਹਾਸ",
  noInvoices: "ਹਾਲੇ ਕੋਈ ਇਨਵੌਇਸ ਨਹੀਂ।",
  downloadInvoice: "ਇਨਵੌਇਸ {number} ਡਾਊਨਲੋਡ ਕਰੋ",

  // Toasts
  changePlanFailed: "ਪਲਾਨ ਬਦਲਣ ਵਿੱਚ ਅਸਫਲ",
  checkoutFailed: "ਚੈੱਕਆਊਟ ਸ਼ੁਰੂ ਕਰਨ ਵਿੱਚ ਅਸਫਲ",
  tryAgain: "ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  // Payment methods (embedded Stripe Elements)
  paymentMethodsTitle: "ਭੁਗਤਾਨ",
  paymentMethodsDescription: "ਆਪਣੀ ਮੈਂਬਰਸ਼ਿਪ ਦਾ ਭੁਗਤਾਨ ਕਰਨ ਲਈ ਵਰਤੇ ਜਾਂਦੇ ਕਾਰਡ ਸ਼ਾਮਲ ਕਰੋ ਅਤੇ ਪ੍ਰਬੰਧਿਤ ਕਰੋ।",
  addPaymentMethod: "ਭੁਗਤਾਨ ਵਿਧੀ ਸ਼ਾਮਲ ਕਰੋ",
  addPaymentMethodHint: "ਨਵਾਂ ਕਾਰਡ ਸੁਰੱਖਿਅਤ ਤਰੀਕੇ ਨਾਲ ਸ਼ਾਮਲ ਕਰੋ। ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਸਾਡੇ ਭੁਗਤਾਨ ਪ੍ਰਦਾਤਾ ਵੱਲੋਂ ਸੰਭਾਲੀ ਜਾਂਦੀ ਹੈ।",
  save: "ਕਾਰਡ ਸੰਭਾਲੋ",
  cancel: "ਰੱਦ ਕਰੋ",
  remove: "ਹਟਾਓ",
  defaultCard: "ਡਿਫਾਲਟ",
  makeDefault: "ਡਿਫਾਲਟ ਬਣਾਓ",
  removeConfirm: "ਕੀ ਇਹ ਭੁਗਤਾਨ ਵਿਧੀ ਹਟਾਉਣੀ ਹੈ?",
  noPaymentMethods: "ਅਜੇ ਤੱਕ ਕੋਈ ਭੁਗਤਾਨ ਵਿਧੀ ਸੰਭਾਲੀ ਨਹੀਂ ਗਈ।",
  cardSaved: "ਕਾਰਡ ਸੰਭਾਲਿਆ ਗਿਆ",
  cardExpires: "ਮਿਆਦ {date}",
  cardError: "ਤੁਹਾਡਾ ਕਾਰਡ ਸੰਭਾਲਿਆ ਨਹੀਂ ਜਾ ਸਕਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  pay: "ਭੁਗਤਾਨ ਕਰੋ",
  completeUpgradeTo: "{plan} ਪਲਾਨ ਵਿੱਚ ਆਪਣਾ ਅੱਪਗ੍ਰੇਡ ਪੂਰਾ ਕਰੋ",
  completeSubscribeTo: "{plan} ਪਲਾਨ ਦੀ ਆਪਣੀ ਸਬਸਕ੍ਰਿਪਸ਼ਨ ਪੂਰੀ ਕਰੋ",
  confirmSubscribeTitle: "ਸਬਸਕ੍ਰਿਪਸ਼ਨ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
  confirmSubscribeText: "{price}/ਮਹੀਨਾ ਤੇ {plan} ਸਬਸਕ੍ਰਾਈਬ ਕਰੀਏ? ਤੁਹਾਡੇ {last4} ਤੇ ਖ਼ਤਮ ਹੋਣ ਵਾਲੇ {brand} ਕਾਰਡ ਤੋਂ ਭੁਗਤਾਨ ਲਿਆ ਜਾਵੇਗਾ।",
  confirmUpgradeTitle: "ਅੱਪਗ੍ਰੇਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
  confirmUpgradeText: "{price}/ਮਹੀਨਾ ਤੇ {plan} ਵਿੱਚ ਅੱਪਗ੍ਰੇਡ ਕਰੀਏ? ਤੁਹਾਡੇ {last4} ਤੇ ਖ਼ਤਮ ਹੋਣ ਵਾਲੇ {brand} ਕਾਰਡ ਤੋਂ ਭੁਗਤਾਨ ਲਿਆ ਜਾਵੇਗਾ।",
  confirmCharge: "ਪੁਸ਼ਟੀ ਕਰੋ ਅਤੇ ਭੁਗਤਾਨ ਕਰੋ",
  addCardFailed: "ਕਾਰਡ ਸ਼ਾਮਲ ਕਰਨਾ ਸ਼ੁਰੂ ਨਹੀਂ ਹੋ ਸਕਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  providerUnsupported: "ਇਹ ਭੁਗਤਾਨ ਪ੍ਰਦਾਤਾ ਅਜੇ ਸਮਰਥਿਤ ਨਹੀਂ ਹੈ।",
}

export default billing
