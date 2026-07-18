const billing = {
  // Page header
  title: "طرح و صورت‌حساب",
  description: "اشتراک، میزان مصرف و جزئیات پرداخت خود را مدیریت کنید.",

  // Usage summary
  currentPlan: "طرح فعلی",
  minutesPerMonth: "{minutes} دقیقه در ماه",
  billingCycle: "دوره صورت‌حساب: {period}",
  minutesUsed: "دقایق مصرف‌شده",
  includedMinutes: "دقایق گنجانده‌شده",
  remaining: "باقی‌مانده",
  usedThisCycle: "{percent}٪ از دقایق گنجانده‌شده در این دوره مصرف شده است",

  // Plan selection
  choosePlan: "طرح خود را انتخاب کنید",
  currentPlanBadge: "طرح فعلی",
  perMonth: "/ماه",
  upgradeTo: "ارتقا به {plan}",
  switchTo: "تغییر به {plan}",
  noPlans: "هیچ طرحی در دسترس نیست.",

  // Payment / Stripe
  paymentSubscription: "پرداخت و اشتراک",
  paymentDescription: "روش‌های پرداخت و اشتراک خود را از طریق پورتال صورت‌حساب Stripe مدیریت کنید.",
  managePaymentMethods: "مدیریت روش‌های پرداخت",

  // Billing history
  billingHistory: "تاریخچه صورت‌حساب",
  noInvoices: "هنوز هیچ فاکتوری وجود ندارد.",
  downloadInvoice: "دانلود فاکتور {number}",

  // Toasts
  changePlanFailed: "تغییر طرح ناموفق بود",
  checkoutFailed: "شروع فرآیند پرداخت ناموفق بود",
  tryAgain: "لطفاً دوباره تلاش کنید.",
  // Payment methods (embedded Stripe Elements)
  paymentMethodsTitle: "پرداخت",
  paymentMethodsDescription: "کارت‌هایی را که برای پرداخت اشتراک خود استفاده می‌کنید اضافه و مدیریت کنید.",
  addPaymentMethod: "افزودن روش پرداخت",
  addPaymentMethodHint: "یک کارت جدید را به‌صورت ایمن اضافه کنید. اطلاعات شما توسط ارائه‌دهنده پرداخت ما مدیریت می‌شود.",
  save: "ذخیره کارت",
  cancel: "لغو",
  remove: "حذف",
  defaultCard: "پیش‌فرض",
  makeDefault: "تنظیم به‌عنوان پیش‌فرض",
  removeConfirm: "این روش پرداخت حذف شود؟",
  noPaymentMethods: "هنوز هیچ روش پرداختی ذخیره نشده است.",
  cardSaved: "کارت ذخیره شد",
  cardExpires: "انقضا {date}",
  cardError: "ذخیره کارت شما ممکن نشد. لطفاً دوباره تلاش کنید.",
  pay: "پرداخت",
  completeUpgradeTo: "ارتقای خود به طرح {plan} را کامل کنید",
  confirmUpgradeTitle: "تأیید ارتقا",
  confirmUpgradeText: "ارتقا به {plan} با {price} در ماه؟ مبلغ از کارت {brand} با پایان {last4} برداشت می‌شود.",
  confirmCharge: "تأیید و پرداخت",
  addCardFailed: "شروع افزودن کارت ممکن نشد. لطفاً دوباره تلاش کنید.",
  providerUnsupported: "این ارائه‌دهنده پرداخت هنوز پشتیبانی نمی‌شود.",
}

export default billing
