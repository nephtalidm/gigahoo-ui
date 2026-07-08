const dashboard = {
  // Sidebar nav
  navOverview: "ਸੰਖੇਪ ਜਾਣਕਾਰੀ",
  navCallHistory: "ਗੱਲਬਾਤ ਇਤਿਹਾਸ",
  navOptionalFeatures: "ਵਿਕਲਪਿਕ ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ",
  navPlanBilling: "ਪਲਾਨ",
  navBilling: "ਭੁਗਤਾਨ",
  navNotifications: "ਸੂਚਨਾਵਾਂ",
  navVoiceAgent: "AI ਵੌਇਸ ਏਜੰਟ",
  navSettings: "ਆਮ ਸੈਟਿੰਗਾਂ",

  // Voice Agent page
  voiceAgentTitle: "AI ਵੌਇਸ ਏਜੰਟ",
  voiceAgentDescription: "ਆਪਣੇ AI ਰਿਸੈਪਸ਼ਨਿਸਟ ਦੇ ਕਾਲ ਕਰਨ ਵਾਲਿਆਂ ਨੂੰ ਨਮਸਕਾਰ ਕਰਨ ਦੇ ਢੰਗ ਅਤੇ ਆਵਾਜ਼ ਨੂੰ ਅਨੁਕੂਲਿਤ ਕਰੋ।",
  greetingLabel: "ਨਮਸਕਾਰ ਸੁਨੇਹਾ",
  greetingHint: "ਕਾਲ ਦਾ ਜਵਾਬ ਦਿੰਦੇ ਸਮੇਂ AI ਸਭ ਤੋਂ ਪਹਿਲਾਂ ਕੀ ਕਹਿੰਦਾ ਹੈ। ਡਿਫੌਲਟ ਨਮਸਕਾਰ ਵਰਤਣ ਲਈ ਖਾਲੀ ਛੱਡੋ।",
  maxCallLabel: "ਵੱਧ ਤੋਂ ਵੱਧ ਕਾਲ ਮਿਆਦ",
  questionsLabel: "ਸਵਾਲ",
  questionsHint: "ਚੁਣੋ ਕਿ ਰਿਸੈਪਸ਼ਨਿਸਟ ਕਿਹੜੀ ਜਾਣਕਾਰੀ ਲਵੇ। ਬੰਦ ਕੀਤੇ ਨਾ ਪੁੱਛੇ ਨਾ ਦਿਖਾਏ ਜਾਣਗੇ।",
  questionName: "ਨਾਮ",
  questionPhone: "ਫ਼ੋਨ ਨੰਬਰ",
  questionAddress: "ਪਤਾ",
  questionEmergency: "ਕੀ ਇਹ ਐਮਰਜੈਂਸੀ ਹੈ?",
  questionNameDesc: "ਕਾਲ ਕਰਨ ਵਾਲੇ ਦਾ ਨਾਮ ਪੁੱਛਦਾ ਤੇ ਸੰਭਾਲਦਾ ਹੈ।",
  questionPhoneDesc: "ਜਿਸ ਨੰਬਰ ਤੋਂ ਕਾਲ ਆਈ ਉਸ ਦੀ ਪੁਸ਼ਟੀ ਕਰਦਾ, ਜਾਂ ਹੋਰ ਪੁੱਛਦਾ ਹੈ।",
  questionAddressDesc: "ਕਾਲ ਕਰਨ ਵਾਲੇ ਦਾ ਪੂਰਾ ਪਤਾ ਪੁੱਛਦਾ ਤੇ ਸੰਭਾਲਦਾ ਹੈ।",
  questionEmergencyDesc: "ਐਮਰਜੈਂਸੀ ਕਾਲਾਂ ਪਛਾਣਦਾ ਤੇ ਲਾਲ ਐਮਰਜੈਂਸੀ ਬੈਜ ਲਾਉਂਦਾ ਹੈ।",
  maxCallHint: "AI ਵੱਲੋਂ ਕਾਲ ਆਪਣੇ-ਆਪ ਖ਼ਤਮ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਇੱਕ ਕਾਲ ਵੱਧ ਤੋਂ ਵੱਧ ਕਿੰਨੀ ਦੇਰ ਚੱਲ ਸਕਦੀ ਹੈ, ਭਾਵੇਂ ਕਾਲ ਕਿਵੇਂ ਵੀ ਚੱਲ ਰਹੀ ਹੋਵੇ। ਕੋਈ ਹੱਦ ਨਾ ਰੱਖਣ ਲਈ ਇਸਨੂੰ 'ਅਸੀਮਤ' 'ਤੇ ਸੈੱਟ ਕਰੋ।",
  maxCallUnit: "ਮਿੰਟ",
  maxCallUnlimited: "ਅਸੀਮਤ",
  maxCallDecrease: "ਵੱਧ ਤੋਂ ਵੱਧ ਕਾਲ ਮਿਆਦ ਘਟਾਓ",
  maxCallIncrease: "ਵੱਧ ਤੋਂ ਵੱਧ ਕਾਲ ਮਿਆਦ ਵਧਾਓ",
  maxCallPlaceholder: "ਕੋਈ ਹੱਦ ਨਹੀਂ",
  voiceLabel: "ਏਜੰਟ ਦੀ ਆਵਾਜ਼",
  voiceHint: "ਉਹ ਆਵਾਜ਼ ਚੁਣੋ ਜਿਸ ਵਿੱਚ ਤੁਹਾਡਾ AI ਰਿਸੈਪਸ਼ਨਿਸਟ ਬੋਲਦਾ ਹੈ। ਹਰ ਇੱਕ ਨੂੰ ਸੁਣਨ ਲਈ ਨਮੂਨਾ ਚਲਾਓ।",
  playSample: "ਨਮੂਨਾ ਚਲਾਓ",
  pauseSample: "ਰੋਕੋ",
  voiceSaved: "ਸੰਭਾਲਿਆ ਗਿਆ",
  voiceCherry: "Cherry (ਨਿੱਘੀ ਔਰਤ)",
  voiceEthan: "Ethan (ਦੋਸਤਾਨਾ ਮਰਦ)",
  voiceChelsie: "Chelsie (ਸਪਸ਼ਟ ਔਰਤ)",
  voiceSerena: "Serena (ਸ਼ਾਂਤ ਔਰਤ)",
  save: "ਸੰਭਾਲੋ",
  navigation: "ਨੈਵੀਗੇਸ਼ਨ",
  openMenu: "ਮੇਨੂ ਖੋਲ੍ਹੋ",
  signOut: "ਸਾਈਨ ਆਊਟ ਕਰੋ",
  loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…",
  planLabel: "{plan} ਪਲਾਨ",

  // Idle session timeout
  idleTitle: "ਕੀ ਤੁਸੀਂ ਹਾਲੇ ਵੀ ਇੱਥੇ ਹੋ?",
  idleDescription: "ਤੁਸੀਂ ਕੁਝ ਸਮੇਂ ਤੋਂ ਨਿਸ਼ਕਿਰਿਆ ਹੋ। ਤੁਹਾਡੀ ਸੁਰੱਖਿਆ ਲਈ, ਟਾਈਮਰ ਖ਼ਤਮ ਹੋਣ 'ਤੇ ਤੁਹਾਨੂੰ ਆਪਣੇ-ਆਪ ਸਾਈਨ ਆਊਟ ਕਰ ਦਿੱਤਾ ਜਾਵੇਗਾ।",
  idleStay: "ਸਾਈਨ ਇਨ ਰਹੋ",
  idleLogoutNow: "ਹੁਣੇ ਲੌਗ ਆਊਟ ਕਰੋ",

  // Overview page
  overviewTitle: "ਸੰਖੇਪ ਜਾਣਕਾਰੀ",
  overviewWelcome: "ਮੁੜ ਜੀ ਆਇਆਂ ਨੂੰ!",
  loadFailed: "ਡੈਸ਼ਬੋਰਡ ਲੋਡ ਕਰਨ ਵਿੱਚ ਅਸਫਲ।",
  tryAgain: "ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
  currentPlan: "ਮੌਜੂਦਾ ਪਲਾਨ",
  minutesPerMonth: "{minutes} ਮਿੰਟ/ਮਹੀਨਾ",
  minutesUsedThisPeriod: "ਇਸ ਅਵਧੀ ਵਿੱਚ {total} ਵਿੱਚੋਂ {used} ਮਿੰਟ ਵਰਤੇ ਗਏ",
  upgradeTo: "{plan} ਵਿੱਚ ਅੱਪਗ੍ਰੇਡ ਕਰੋ",
  managePlan: "ਪਲਾਨ ਦਾ ਪ੍ਰਬੰਧ ਕਰੋ",
  recentCalls: "ਹਾਲੀਆ ਕਾਲਾਂ",
  viewAll: "ਸਾਰੀਆਂ ਵੇਖੋ",
  noCalls: "ਹਾਲੇ ਕੋਈ ਕਾਲ ਨਹੀਂ। ਤੁਹਾਡਾ AI ਰਿਸੈਪਸ਼ਨਿਸਟ ਤਿਆਰ ਹੈ।",

  // Metric cards
  callsAnswered: "ਜਵਾਬ ਦਿੱਤੀਆਂ ਕਾਲਾਂ",
  avgCallDuration: "ਔਸਤ ਕਾਲ ਅਵਧੀ",
  minutesRemaining: "ਬਾਕੀ ਮਿੰਟ",
  secondsSuffix: "ਸਕਿੰਟ",

  // Minute usage widget
  minuteUsage: "ਮਿੰਟ ਵਰਤੋਂ",
  billingPeriod: "ਬਿਲਿੰਗ ਅਵਧੀ: {period}",
  statusOverLimit: "ਸੀਮਾ ਤੋਂ ਵੱਧ",
  statusNearLimit: "ਸੀਮਾ ਦੇ ਨੇੜੇ",
  statusHealthy: "ਠੀਕ ਵਰਤੋਂ",
  minutesUsedLabel: "ਵਰਤੇ ਗਏ ਮਿੰਟ",
  ofTotal: "{total} ਵਿੱਚੋਂ",
  statUsed: "ਵਰਤੇ ਗਏ",
  statRemaining: "ਬਾਕੀ",
  statUsedPct: "ਵਰਤੇ ਗਏ %",
  includedMinutesRemaining: "{total} ਸ਼ਾਮਲ ਮਿੰਟਾਂ ਵਿੱਚੋਂ {remaining} ਬਾਕੀ",
  changePlan: "ਪਲਾਨ ਬਦਲੋ",

  // Upgrade card
  upgradeHeading: "{feature} ਨੂੰ ਸਮਰੱਥ ਕਰਨ ਲਈ {plan} ਵਿੱਚ ਅੱਪਗ੍ਰੇਡ ਕਰੋ",
  upgradeSubtext: "ਇਹ ਵਿਸ਼ੇਸ਼ਤਾ {plan} ਪਲਾਨ ਅਤੇ ਇਸ ਤੋਂ ਉੱਪਰ ਉਪਲਬਧ ਹੈ।",

  // Status badges
  statusAnswered: "ਜਵਾਬ ਦਿੱਤੀ",
  statusCompleted: "ਪੂਰੀ ਹੋਈ",
  statusMissed: "ਖੁੰਝੀ",
  statusFailed: "ਅਸਫਲ",

  // Home page link
  homePage: "ਮੁੱਖ ਪੰਨਾ",

  // Unsaved-changes guard
  unsavedTitle: "ਨਾ-ਸੰਭਾਲੇ ਬਦਲਾਅ",
  unsavedMessage: "ਤੁਹਾਡੇ ਕੋਲ ਨਾ-ਸੰਭਾਲੇ ਬਦਲਾਅ ਹਨ। ਸੰਭਾਲੇ ਬਿਨਾਂ ਛੱਡਣਾ ਹੈ?",
  unsavedLeave: "ਸੰਭਾਲੇ ਬਿਨਾਂ ਛੱਡੋ",
  unsavedStay: "ਪੰਨੇ 'ਤੇ ਰਹੋ",
}

export default dashboard
