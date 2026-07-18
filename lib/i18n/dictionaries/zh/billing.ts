const billing = {
  // Page header
  title: "套餐与计费",
  description: "管理您的订阅、用量和付款详情。",

  // Usage summary
  currentPlan: "当前套餐",
  minutesPerMonth: "{minutes} 分钟/月",
  billingCycle: "计费周期：{period}",
  minutesUsed: "已用分钟数",
  includedMinutes: "套餐内分钟数",
  remaining: "剩余",
  usedThisCycle: "本周期已使用套餐内分钟数的 {percent}%",

  // Plan selection
  choosePlan: "选择您的套餐",
  currentPlanBadge: "当前套餐",
  perMonth: "/月",
  upgradeTo: "升级到 {plan}",
  switchTo: "切换到 {plan}",
  noPlans: "暂无可用套餐。",

  // Payment / Stripe
  paymentSubscription: "付款与订阅",
  paymentDescription: "通过 Stripe 计费门户管理您的付款方式和订阅。",
  managePaymentMethods: "管理支付方式",

  // Billing history
  billingHistory: "计费记录",
  noInvoices: "暂无发票。",
  downloadInvoice: "下载发票 {number}",

  // Toasts
  changePlanFailed: "套餐更改失败",
  checkoutFailed: "结账启动失败",
  tryAgain: "请重试。",
  // Payment methods (embedded Stripe Elements)
  paymentMethodsTitle: "支付方式",
  paymentMethodsDescription: "添加并管理用于支付订阅的银行卡。",
  addPaymentMethod: "添加支付方式",
  addPaymentMethodHint: "安全地添加新卡。您的信息由我们的支付服务商处理。",
  save: "保存卡片",
  cancel: "取消",
  remove: "移除",
  defaultCard: "默认",
  makeDefault: "设为默认",
  removeConfirm: "移除此支付方式？",
  noPaymentMethods: "尚未保存任何支付方式。",
  cardSaved: "卡片已保存",
  cardExpires: "有效期至 {date}",
  cardError: "无法保存您的卡片。请重试。",
  pay: "支付",
  completeUpgrade: "完成套餐升级",
  confirmUpgradeTitle: "确认升级",
  confirmUpgradeText: "以每月{price}升级到{plan}？将从尾号{last4}的{brand}卡扣款。",
  confirmCharge: "确认并支付",
  addCardFailed: "无法开始添加卡片。请重试。",
  providerUnsupported: "尚不支持此支付服务商。",
}

export default billing
