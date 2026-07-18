const billing = {
  // Page header
  title: "方案與帳單",
  description: "管理你嘅訂閱、用量同付款資料。",

  // Usage summary
  currentPlan: "目前方案",
  minutesPerMonth: "每月 {minutes} 分鐘",
  billingCycle: "帳單週期：{period}",
  minutesUsed: "已用分鐘數",
  includedMinutes: "包含分鐘數",
  remaining: "剩餘",
  usedThisCycle: "今期已用咗包含分鐘數嘅 {percent}%",

  // Plan selection
  choosePlan: "揀你嘅方案",
  currentPlanBadge: "目前方案",
  perMonth: "/每月",
  upgradeTo: "升級至 {plan}",
  switchTo: "轉用 {plan}",
  noPlans: "暫時冇方案可選。",

  // Payment / Stripe
  paymentSubscription: "付款與訂閱",
  paymentDescription: "透過 Stripe 帳單入口管理你嘅付款方式同訂閱。",
  managePaymentMethods: "管理付款方式",

  // Billing history
  billingHistory: "帳單記錄",
  noInvoices: "暫時冇發票。",
  downloadInvoice: "下載發票 {number}",

  // Toasts
  changePlanFailed: "更改方案失敗",
  checkoutFailed: "開始結帳失敗",
  tryAgain: "請再試一次。",
  // Payment methods (embedded Stripe Elements)
  paymentMethodsTitle: "付款方式",
  paymentMethodsDescription: "新增同管理用嚟支付訂閱嘅信用卡。",
  addPaymentMethod: "新增付款方式",
  addPaymentMethodHint: "安全噉新增一張新卡。你嘅資料由我哋嘅付款服務商處理。",
  save: "儲存卡片",
  cancel: "取消",
  remove: "移除",
  defaultCard: "預設",
  makeDefault: "設為預設",
  removeConfirm: "移除呢個付款方式？",
  noPaymentMethods: "仲未儲存任何付款方式。",
  cardSaved: "卡片已儲存",
  cardExpires: "有效期至 {date}",
  cardError: "無法儲存你嘅卡片。請再試一次。",
  pay: "付款",
  completeUpgradeTo: "完成升級至{plan}計劃",
  completeSubscribeTo: "完成訂閱{plan}計劃",
  confirmSubscribeTitle: "確認訂閱",
  confirmSubscribeText: "以每月{price}訂閱{plan}？將會從尾號{last4}嘅{brand}卡扣款。",
  confirmUpgradeTitle: "確認升級",
  confirmUpgradeText: "以每月{price}升級至{plan}？將會從尾號{last4}嘅{brand}卡扣款。",
  confirmCharge: "確認並付款",
  addCardFailed: "無法開始新增卡片。請再試一次。",
  providerUnsupported: "暫時未支援呢個付款服務商。",
}

export default billing
