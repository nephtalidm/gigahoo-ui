const billing = {
  // Page header
  title: "الخطة والفوترة",
  description: "إدارة اشتراكك واستخدامك وتفاصيل الدفع الخاصة بك.",

  // Usage summary
  currentPlan: "الخطة الحالية",
  minutesPerMonth: "{minutes} دقيقة/شهر",
  billingCycle: "دورة الفوترة: {period}",
  minutesUsed: "الدقائق المستخدمة",
  includedMinutes: "الدقائق المضمّنة",
  remaining: "المتبقية",
  usedThisCycle: "تم استخدام {percent}% من الدقائق المضمّنة في هذه الدورة",

  // Plan selection
  choosePlan: "اختر خطتك",
  currentPlanBadge: "الخطة الحالية",
  perMonth: "/شهر",
  upgradeTo: "الترقية إلى {plan}",
  switchTo: "التبديل إلى {plan}",
  noPlans: "لا توجد خطط متاحة.",

  // Payment / Stripe
  paymentSubscription: "الدفع والاشتراك",
  paymentDescription: "إدارة طرق الدفع والاشتراك من خلال بوابة الفوترة Stripe.",
  openBillingPortal: "فتح بوابة الفوترة",

  // Billing history
  billingHistory: "سجل الفوترة",
  noInvoices: "لا توجد فواتير بعد.",
  downloadInvoice: "تنزيل الفاتورة {number}",

  // Toasts
  changePlanFailed: "فشل تغيير الخطة",
  checkoutFailed: "فشل بدء عملية الدفع",
  portalFailed: "فشل فتح بوابة الفوترة",
  tryAgain: "يرجى المحاولة مرة أخرى.",
  // Payment methods (embedded Stripe Elements)
  paymentMethodsTitle: "المدفوعات",
  paymentMethodsDescription: "أضف وأدر البطاقات المستخدمة لدفع اشتراكك.",
  addPaymentMethod: "إضافة طريقة دفع",
  addPaymentMethodHint: "أضف بطاقة جديدة بأمان. تتم معالجة بياناتك من قبل مزوّد الدفع لدينا.",
  save: "حفظ البطاقة",
  cancel: "إلغاء",
  remove: "إزالة",
  defaultCard: "افتراضية",
  makeDefault: "تعيين كافتراضية",
  removeConfirm: "إزالة طريقة الدفع هذه؟",
  noPaymentMethods: "لا توجد طرق دفع محفوظة بعد.",
  cardSaved: "تم حفظ البطاقة",
  cardExpires: "تنتهي في {date}",
  cardError: "تعذّر حفظ بطاقتك. يرجى المحاولة مرة أخرى.",
  pay: "ادفع",
  completeUpgrade: "أكمل ترقية خطتك",
  addCardFailed: "تعذّر بدء إضافة بطاقة. يرجى المحاولة مرة أخرى.",
  providerUnsupported: "مزوّد الدفع هذا غير مدعوم بعد.",
}

export default billing
