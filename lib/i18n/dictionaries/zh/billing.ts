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
  openBillingPortal: "打开计费门户",

  // Billing history
  billingHistory: "计费记录",
  noInvoices: "暂无发票。",
  downloadInvoice: "下载发票 {number}",

  // Toasts
  changePlanFailed: "套餐更改失败",
  checkoutFailed: "结账启动失败",
  portalFailed: "计费门户打开失败",
  tryAgain: "请重试。",
}

export default billing
