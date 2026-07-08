const dashboard = {
  // Sidebar nav
  navOverview: "概览",
  navCallHistory: "对话记录",
  navOptionalFeatures: "可选功能",
  navPlanBilling: "套餐",
  navBilling: "支付方式",
  navNotifications: "通知",
  navVoiceAgent: "AI 语音助手",
  navSettings: "常规设置",

  // Voice Agent page
  voiceAgentTitle: "AI 语音助手",
  voiceAgentDescription: "自定义 AI 接待员问候来电者的方式及其声音。",
  greetingLabel: "问候语消息",
  greetingHint: "AI 接听电话时最先说的话。留空则使用默认问候语。",
  maxCallLabel: "最长通话时长",
  questionsLabel: "问题",
  questionsHint: "选择接待员收集哪些信息。关闭的项目不会询问或显示。",
  questionName: "姓名",
  questionPhone: "电话号码",
  questionAddress: "地址",
  questionEmergency: "是否紧急？",
  questionNameDesc: "询问并保存来电者的姓名。",
  questionPhoneDesc: "自动从来电号码获取；AI 会确认这是否是最佳回拨号码，或询问其他号码。",
  questionAddressDesc: "询问并保存来电者的完整地址。",
  questionEmergencyDesc: "识别紧急来电并用红色紧急标记标注。",
  maxCallHint: "单次通话在 AI 自动结束前可持续的最长时间，无论通话进行得如何。设为“不限”即不设上限。",
  maxCallUnit: "分钟",
  maxCallUnlimited: "不限",
  maxCallDecrease: "减少最长通话时长",
  maxCallIncrease: "增加最长通话时长",
  maxCallPlaceholder: "不限制",
  voiceLabel: "助手声音",
  voiceHint: "选择 AI 接待员使用的声音。播放样本即可试听每种声音。",
  playSample: "播放样本",
  pauseSample: "暂停",
  voiceSaved: "已保存",
  voiceCherry: "Cherry（温暖女声）",
  voiceEthan: "Ethan（友好男声）",
  voiceChelsie: "Chelsie（清晰女声）",
  voiceSerena: "Serena（沉稳女声）",
  save: "保存",
  navigation: "导航",
  openMenu: "打开菜单",
  signOut: "退出登录",
  loading: "加载中…",
  planLabel: "{plan} 套餐",

  // Overview page
  overviewTitle: "概览",
  overviewWelcome: "欢迎回来！",
  loadFailed: "仪表盘加载失败。",
  tryAgain: "重试",
  currentPlan: "当前套餐",
  minutesPerMonth: "{minutes} 分钟/月",
  minutesUsedThisPeriod: "本周期已使用 {used} 分钟，共 {total} 分钟",
  upgradeTo: "升级到 {plan}",
  managePlan: "管理套餐",
  recentCalls: "最近通话",
  viewAll: "查看全部",
  noCalls: "暂无通话。您的 AI 接待员已准备就绪。",

  // Metric cards
  callsAnswered: "已接听通话",
  avgCallDuration: "平均通话时长",
  minutesRemaining: "剩余分钟数",
  secondsSuffix: "秒",

  // Minute usage widget
  minuteUsage: "分钟用量",
  billingPeriod: "计费周期：{period}",
  statusOverLimit: "超出限额",
  statusNearLimit: "接近限额",
  statusHealthy: "用量正常",
  minutesUsedLabel: "已用分钟数",
  ofTotal: "共 {total}",
  statUsed: "已使用",
  statRemaining: "剩余",
  statUsedPct: "已用百分比",
  includedMinutesRemaining: "套餐内分钟数剩余 {remaining}，共 {total}",
  changePlan: "更改套餐",

  // Upgrade card
  upgradeHeading: "升级到 {plan} 以启用 {feature}",
  upgradeSubtext: "此功能在 {plan} 及以上套餐中可用。",

  // Status badges
  statusAnswered: "已接听",
  statusCompleted: "已完成",
  statusMissed: "未接听",
  statusFailed: "失败",

  // Home page link
  homePage: "主页",
  idleTitle: "您还在吗？",
  idleDescription: "您已有一段时间没有操作。为了您的安全，计时结束后将自动退出登录。",
  idleStay: "保持登录",
  idleLogoutNow: "立即退出",

  // Unsaved-changes guard
  unsavedTitle: "未保存的更改",
  unsavedMessage: "您有未保存的更改。要不保存就离开吗？",
  unsavedLeave: "不保存就离开",
  unsavedStay: "留在页面",
}

export default dashboard
