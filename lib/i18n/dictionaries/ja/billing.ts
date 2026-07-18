const billing = {
  // Page header
  title: "プランと請求",
  description: "サブスクリプション、利用状況、支払い情報を管理します。",

  // Usage summary
  currentPlan: "現在のプラン",
  minutesPerMonth: "{minutes}分/月",
  billingCycle: "請求サイクル：{period}",
  minutesUsed: "使用済みの分数",
  includedMinutes: "含まれる分数",
  remaining: "残り",
  usedThisCycle: "今サイクルで含まれる分数の{percent}%を使用",

  // Plan selection
  choosePlan: "プランを選択",
  currentPlanBadge: "現在のプラン",
  perMonth: "/月",
  upgradeTo: "{plan}にアップグレード",
  switchTo: "{plan}に切り替え",
  noPlans: "利用可能なプランがありません。",

  // Payment / Stripe
  paymentSubscription: "支払いとサブスクリプション",
  paymentDescription: "Stripe請求ポータルを通じて支払い方法とサブスクリプションを管理します。",
  openBillingPortal: "請求ポータルを開く",

  // Billing history
  billingHistory: "請求履歴",
  noInvoices: "請求書はまだありません。",
  downloadInvoice: "請求書{number}をダウンロード",

  // Toasts
  changePlanFailed: "プランの変更に失敗しました",
  checkoutFailed: "チェックアウトの開始に失敗しました",
  portalFailed: "請求ポータルを開けませんでした",
  tryAgain: "もう一度お試しください。",
  // Payment methods (embedded Stripe Elements)
  paymentMethodsTitle: "お支払い",
  paymentMethodsDescription: "サブスクリプションの支払いに使用するカードを追加・管理します。",
  addPaymentMethod: "お支払い方法を追加",
  addPaymentMethodHint: "新しいカードを安全に追加します。お客様の情報は決済プロバイダーが処理します。",
  save: "カードを保存",
  cancel: "キャンセル",
  remove: "削除",
  defaultCard: "デフォルト",
  makeDefault: "デフォルトに設定",
  removeConfirm: "このお支払い方法を削除しますか？",
  noPaymentMethods: "保存されたお支払い方法はまだありません。",
  cardSaved: "カードを保存しました",
  cardExpires: "有効期限 {date}",
  cardError: "カードを保存できませんでした。もう一度お試しください。",
  pay: "支払う",
  completeUpgrade: "プランのアップグレードを完了",
  addCardFailed: "カードの追加を開始できませんでした。もう一度お試しください。",
  providerUnsupported: "この決済プロバイダーはまだサポートされていません。",
}

export default billing
