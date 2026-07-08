const dashboard = {
  // Sidebar nav
  navOverview: "نظرة عامة",
  navCallHistory: "سجل المحادثات",
  navOptionalFeatures: "الميزات الاختيارية",
  navPlanBilling: "الخطة",
  navBilling: "المدفوعات",
  navNotifications: "الإشعارات",
  navVoiceAgent: "وكيل صوتي بالذكاء الاصطناعي",
  navSettings: "الإعدادات العامة",

  // Voice Agent page
  voiceAgentTitle: "وكيل صوتي بالذكاء الاصطناعي",
  voiceAgentDescription: "خصّص كيف يرحّب موظف الاستقبال بالذكاء الاصطناعي بالمتصلين وكيف يبدو صوته.",
  greetingLabel: "رسالة التحية",
  greetingHint: "ما يقوله الذكاء الاصطناعي عند الرد على المكالمة. اتركه فارغًا لاستخدام التحية الافتراضية.",
  maxCallLabel: "الحد الأقصى لمدة المكالمة",
  questionsLabel: "الأسئلة",
  questionsHint: "اختر البيانات التي يجمعها موظف الاستقبال. ما يتم إيقافه لا يُطلب ولا يُعرض.",
  questionName: "الاسم",
  questionPhone: "رقم الهاتف",
  questionAddress: "العنوان",
  questionEmergency: "هل هي حالة طارئة؟",
  questionNameDesc: "يسأل عن اسم المتصل ويحفظه.",
  questionPhoneDesc: "يؤكد الرقم المتصل منه للاتصال، أو يطلب رقمًا آخر.",
  questionAddressDesc: "يسأل عن عنوان المتصل الكامل ويحفظه.",
  questionEmergencyDesc: "يكتشف المكالمات العاجلة ويضع عليها شارة طوارئ حمراء.",
  maxCallHint: "أطول مدة يمكن أن تستمر فيها مكالمة واحدة قبل أن ينهيها الذكاء الاصطناعي تلقائيًا، بغض النظر عن سير المكالمة. اضبطه على «بلا حد» لعدم وضع أي حد أقصى.",
  maxCallUnit: "دقيقة",
  maxCallUnlimited: "بلا حد",
  maxCallDecrease: "تقليل الحد الأقصى لمدة المكالمة",
  maxCallIncrease: "زيادة الحد الأقصى لمدة المكالمة",
  maxCallPlaceholder: "بدون حد",
  voiceLabel: "صوت الوكيل",
  voiceHint: "اختر الصوت الذي يتحدث به موظف الاستقبال بالذكاء الاصطناعي. شغّل عينة لسماع كل صوت.",
  playSample: "تشغيل عينة",
  pauseSample: "إيقاف مؤقت",
  voiceSaved: "تم الحفظ",
  voiceCherry: "Cherry (صوت أنثوي دافئ)",
  voiceEthan: "Ethan (صوت ذكوري ودود)",
  voiceChelsie: "Chelsie (صوت أنثوي واضح)",
  voiceSerena: "Serena (صوت أنثوي هادئ)",
  save: "حفظ",
  navigation: "التنقّل",
  openMenu: "فتح القائمة",
  signOut: "تسجيل الخروج",
  loading: "جارٍ التحميل…",
  planLabel: "خطة {plan}",

  // Idle session timeout
  idleTitle: "هل ما زلت هنا؟",
  idleDescription: "لقد كنت غير نشط لفترة. لحماية حسابك، سيتم تسجيل خروجك تلقائيًا عند انتهاء المؤقّت.",
  idleStay: "البقاء مسجّلاً للدخول",
  idleLogoutNow: "تسجيل الخروج الآن",

  // Overview page
  overviewTitle: "نظرة عامة",
  overviewWelcome: "مرحبًا بعودتك!",
  loadFailed: "فشل تحميل لوحة التحكم.",
  tryAgain: "حاول مرة أخرى",
  currentPlan: "الخطة الحالية",
  minutesPerMonth: "{minutes} دقيقة/شهر",
  minutesUsedThisPeriod: "تم استخدام {used} من {total} دقيقة خلال هذه الفترة",
  upgradeTo: "الترقية إلى {plan}",
  managePlan: "إدارة الخطة",
  recentCalls: "المكالمات الأخيرة",
  viewAll: "عرض الكل",
  noCalls: "لا توجد مكالمات بعد. موظف الاستقبال بالذكاء الاصطناعي جاهز للعمل.",

  // Metric cards
  callsAnswered: "المكالمات المُجابة",
  avgCallDuration: "متوسط مدة المكالمة",
  minutesRemaining: "الدقائق المتبقية",
  secondsSuffix: "ثانية",

  // Minute usage widget
  minuteUsage: "استخدام الدقائق",
  billingPeriod: "فترة الفوترة: {period}",
  statusOverLimit: "تجاوز الحد",
  statusNearLimit: "قريب من الحد",
  statusHealthy: "استخدام جيد",
  minutesUsedLabel: "الدقائق المستخدمة",
  ofTotal: "من {total}",
  statUsed: "المستخدَمة",
  statRemaining: "المتبقية",
  statUsedPct: "النسبة المستخدمة",
  includedMinutesRemaining: "تبقّى {remaining} من {total} دقيقة مضمّنة",
  changePlan: "تغيير الخطة",

  // Upgrade card
  upgradeHeading: "قم بالترقية إلى {plan} لتفعيل {feature}",
  upgradeSubtext: "تتوفّر هذه الميزة في خطة {plan} وما فوقها.",

  // Status badges
  statusAnswered: "تم الرد",
  statusCompleted: "مكتملة",
  statusMissed: "فائتة",
  statusFailed: "فاشلة",

  // Home page link
  homePage: "الصفحة الرئيسية",

  // Unsaved-changes guard
  unsavedTitle: "تغييرات غير محفوظة",
  unsavedMessage: "لديك تغييرات غير محفوظة. هل تريد المغادرة دون حفظ؟",
  unsavedLeave: "المغادرة دون حفظ",
  unsavedStay: "البقاء في الصفحة",
}

export default dashboard
