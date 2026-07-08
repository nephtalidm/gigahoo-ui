const dashboard = {
  // Sidebar nav
  navOverview: "개요",
  navCallHistory: "대화 기록",
  navOptionalFeatures: "선택 기능",
  navPlanBilling: "요금제",
  navBilling: "결제 수단",
  navNotifications: "알림",
  navVoiceAgent: "AI 음성 에이전트",
  navSettings: "일반 설정",

  // Voice Agent page
  voiceAgentTitle: "AI 음성 에이전트",
  voiceAgentDescription: "AI 안내원이 발신자에게 인사하는 방식과 목소리를 맞춤 설정하세요.",
  greetingLabel: "인사말 메시지",
  greetingHint: "AI가 전화를 받을 때 처음 하는 말입니다. 비워 두면 기본 인사말이 사용됩니다.",
  maxCallLabel: "최대 통화 시간",
  questionsLabel: "질문",
  questionsHint: "접수원이 수집할 정보를 선택하세요. 끈 항목은 묻지도 표시하지도 않습니다.",
  questionName: "이름",
  questionPhone: "전화번호",
  questionAddress: "주소",
  questionEmergency: "긴급 상황인가요?",
  questionNameDesc: "발신자의 이름을 묻고 저장합니다.",
  questionPhoneDesc: "발신 번호를 콜백으로 확인하거나 다른 번호를 묻습니다.",
  questionAddressDesc: "발신자의 전체 주소를 묻고 저장합니다.",
  questionEmergencyDesc: "긴급 통화를 감지하여 빨간색 긴급 배지로 표시합니다.",
  maxCallHint: "통화 상황과 관계없이 AI가 통화를 자동으로 종료하기 전까지 한 통화가 지속될 수 있는 최대 시간입니다. 제한을 두지 않으려면 '무제한'으로 설정하세요.",
  maxCallUnit: "분",
  maxCallUnlimited: "무제한",
  maxCallDecrease: "최대 통화 시간 줄이기",
  maxCallIncrease: "최대 통화 시간 늘리기",
  maxCallPlaceholder: "제한 없음",
  voiceLabel: "에이전트 음성",
  voiceHint: "AI 안내원이 사용할 음성을 선택하세요. 샘플을 재생해 각 음성을 들어볼 수 있습니다.",
  playSample: "샘플 재생",
  pauseSample: "일시정지",
  voiceSaved: "저장됨",
  voiceCherry: "Cherry (따뜻한 여성)",
  voiceEthan: "Ethan (친근한 남성)",
  voiceChelsie: "Chelsie (또렷한 여성)",
  voiceSerena: "Serena (차분한 여성)",
  save: "저장",
  navigation: "탐색",
  openMenu: "메뉴 열기",
  signOut: "로그아웃",
  loading: "불러오는 중…",
  planLabel: "{plan} 요금제",

  // Overview page
  overviewTitle: "개요",
  overviewWelcome: "다시 오신 것을 환영합니다!",
  loadFailed: "대시보드를 불러오지 못했습니다.",
  tryAgain: "다시 시도",
  currentPlan: "현재 요금제",
  minutesPerMonth: "월 {minutes}분",
  minutesUsedThisPeriod: "이번 기간에 {total}분 중 {used}분 사용",
  upgradeTo: "{plan}(으)로 업그레이드",
  managePlan: "요금제 관리",
  recentCalls: "최근 통화",
  viewAll: "전체 보기",
  noCalls: "아직 통화가 없습니다. AI 응대원이 준비되어 있습니다.",

  // Metric cards
  callsAnswered: "응대한 통화",
  avgCallDuration: "평균 통화 시간",
  minutesRemaining: "남은 분",
  secondsSuffix: "초",

  // Minute usage widget
  minuteUsage: "분 사용량",
  billingPeriod: "결제 기간: {period}",
  statusOverLimit: "한도 초과",
  statusNearLimit: "한도 임박",
  statusHealthy: "정상 사용",
  minutesUsedLabel: "사용한 분",
  ofTotal: "{total} 중",
  statUsed: "사용",
  statRemaining: "남음",
  statUsedPct: "사용률 %",
  includedMinutesRemaining: "포함된 {total}분 중 {remaining}분 남음",
  changePlan: "요금제 변경",

  // Upgrade card
  upgradeHeading: "{feature}을(를) 사용하려면 {plan}(으)로 업그레이드하세요",
  upgradeSubtext: "이 기능은 {plan} 요금제 이상에서 사용할 수 있습니다.",

  // Status badges
  statusAnswered: "응대함",
  statusCompleted: "완료됨",
  statusMissed: "놓침",
  statusFailed: "실패함",

  // Home page link
  homePage: "홈페이지",
  idleTitle: "아직 계신가요?",
  idleDescription: "한동안 활동이 없었습니다. 보안을 위해 타이머가 종료되면 자동으로 로그아웃됩니다.",
  idleStay: "로그인 유지",
  idleLogoutNow: "지금 로그아웃",

  // Unsaved-changes guard
  unsavedTitle: "저장되지 않은 변경 사항",
  unsavedMessage: "저장되지 않은 변경 사항이 있습니다. 저장하지 않고 나가시겠어요?",
  unsavedLeave: "저장하지 않고 나가기",
  unsavedStay: "페이지에 머무르기",
}

export default dashboard
