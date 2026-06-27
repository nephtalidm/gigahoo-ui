const dashboard = {
  // Sidebar nav
  navOverview: "概要",
  navCallHistory: "通話履歴",
  navOptionalFeatures: "オプション機能",
  navPlanBilling: "プラン",
  navBilling: "お支払い",
  navNotifications: "通知",
  navVoiceAgent: "AI音声エージェント",
  navSettings: "一般設定",

  // Voice Agent page
  voiceAgentTitle: "AI音声エージェント",
  voiceAgentDescription: "AI受付係が発信者に挨拶する方法や声をカスタマイズします。",
  greetingLabel: "あいさつ",
  greetingHint: "AIが電話に出たときに最初に話す内容です。空欄にするとデフォルトのあいさつが使われます。",
  voiceLabel: "エージェントの声",
  voiceHint: "AI受付係が話す声を選択します。サンプルを再生して各声を確認できます。",
  playSample: "サンプルを再生",
  voiceSaved: "保存しました",
  voiceCherry: "Cherry（温かみのある女性）",
  voiceEthan: "Ethan（親しみやすい男性）",
  voiceChelsie: "Chelsie（はっきりした女性）",
  voiceSerena: "Serena（落ち着いた女性）",
  save: "保存",
  navigation: "ナビゲーション",
  openMenu: "メニューを開く",
  signOut: "ログアウト",
  loading: "読み込み中…",
  planLabel: "{plan}プラン",

  // Overview page
  overviewTitle: "概要",
  overviewWelcome: "おかえりなさい！",
  loadFailed: "ダッシュボードの読み込みに失敗しました。",
  tryAgain: "再試行",
  currentPlan: "現在のプラン",
  minutesPerMonth: "{minutes}分/月",
  minutesUsedThisPeriod: "今期は{total}分のうち{used}分を使用",
  upgradeTo: "{plan}にアップグレード",
  managePlan: "プランを管理",
  recentCalls: "最近の通話",
  viewAll: "すべて表示",
  noCalls: "まだ通話はありません。AI受付の準備は整っています。",

  // Metric cards
  callsAnswered: "応答した通話数",
  avgCallDuration: "平均通話時間",
  minutesRemaining: "残りの分数",
  secondsSuffix: "秒",

  // Minute usage widget
  minuteUsage: "分数の使用状況",
  billingPeriod: "請求期間：{period}",
  statusOverLimit: "上限超過",
  statusNearLimit: "上限間近",
  statusHealthy: "正常な使用状況",
  minutesUsedLabel: "使用済みの分数",
  ofTotal: "/ {total}",
  statUsed: "使用済み",
  statRemaining: "残り",
  statUsedPct: "使用率",
  includedMinutesRemaining: "含まれる{total}分のうち{remaining}分が残っています",
  changePlan: "プランを変更",

  // Upgrade card
  upgradeHeading: "{feature}を有効にするには{plan}にアップグレード",
  upgradeSubtext: "この機能は{plan}プラン以上でご利用いただけます。",

  // Status badges
  statusAnswered: "応答済み",
  statusCompleted: "完了",
  statusMissed: "不在",
  statusFailed: "失敗",
  idleTitle: "まだいらっしゃいますか？",
  idleDescription: "しばらく操作がありませんでした。セキュリティのため、タイマーが終了すると自動的にログアウトされます。",
  idleStay: "ログインしたままにする",
  idleLogoutNow: "今すぐログアウト",
}

export default dashboard
