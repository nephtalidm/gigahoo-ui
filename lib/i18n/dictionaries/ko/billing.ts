const billing = {
  // Page header
  title: "요금제 및 결제",
  description: "구독, 사용량, 결제 정보를 관리하세요.",

  // Usage summary
  currentPlan: "현재 요금제",
  minutesPerMonth: "월 {minutes}분",
  billingCycle: "결제 주기: {period}",
  minutesUsed: "사용한 분",
  includedMinutes: "포함된 분",
  remaining: "남음",
  usedThisCycle: "이번 주기에 포함된 분의 {percent}% 사용",

  // Plan selection
  choosePlan: "요금제 선택",
  currentPlanBadge: "현재 요금제",
  perMonth: "/월",
  upgradeTo: "{plan}(으)로 업그레이드",
  switchTo: "{plan}(으)로 전환",
  noPlans: "사용 가능한 요금제가 없습니다.",

  // Payment / Stripe
  paymentSubscription: "결제 및 구독",
  paymentDescription: "Stripe 결제 포털을 통해 결제 수단과 구독을 관리하세요.",
  openBillingPortal: "결제 포털 열기",

  // Billing history
  billingHistory: "결제 내역",
  noInvoices: "아직 청구서가 없습니다.",
  downloadInvoice: "청구서 {number} 다운로드",

  // Toasts
  changePlanFailed: "요금제 변경에 실패했습니다",
  checkoutFailed: "결제 시작에 실패했습니다",
  portalFailed: "결제 포털을 여는 데 실패했습니다",
  tryAgain: "다시 시도해 주세요.",
}

export default billing
