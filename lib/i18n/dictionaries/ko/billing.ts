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
  managePaymentMethods: "결제 수단 관리",

  // Billing history
  billingHistory: "결제 내역",
  noInvoices: "아직 청구서가 없습니다.",
  downloadInvoice: "청구서 {number} 다운로드",

  // Toasts
  changePlanFailed: "요금제 변경에 실패했습니다",
  checkoutFailed: "결제 시작에 실패했습니다",
  tryAgain: "다시 시도해 주세요.",
  // Payment methods (embedded Stripe Elements)
  paymentMethodsTitle: "결제 수단",
  paymentMethodsDescription: "구독 결제에 사용되는 카드를 추가하고 관리하세요.",
  addPaymentMethod: "결제 수단 추가",
  addPaymentMethodHint: "새 카드를 안전하게 추가하세요. 고객님의 정보는 결제 제공업체가 처리합니다.",
  save: "카드 저장",
  cancel: "취소",
  remove: "삭제",
  defaultCard: "기본",
  makeDefault: "기본으로 설정",
  removeConfirm: "이 결제 수단을 삭제할까요?",
  noPaymentMethods: "아직 저장된 결제 수단이 없습니다.",
  cardSaved: "카드가 저장되었습니다",
  cardExpires: "만료 {date}",
  cardError: "카드를 저장할 수 없습니다. 다시 시도해 주세요.",
  pay: "결제",
  completeUpgradeTo: "{plan} 플랜으로 업그레이드 완료",
  confirmUpgradeTitle: "업그레이드 확인",
  confirmUpgradeText: "월 {price}에 {plan}(으)로 업그레이드할까요? {last4}(으)로 끝나는 {brand} 카드로 결제됩니다.",
  confirmCharge: "확인 및 결제",
  addCardFailed: "카드 추가를 시작할 수 없습니다. 다시 시도해 주세요.",
  providerUnsupported: "이 결제 제공업체는 아직 지원되지 않습니다.",
}

export default billing
