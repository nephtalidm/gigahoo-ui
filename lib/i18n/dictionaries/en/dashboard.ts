const dashboard = {
  // Sidebar nav
  navOverview: "Overview",
  navCallHistory: "Conversation History",
  navOptionalFeatures: "Optional Features",
  navPlanBilling: "Plan",
  navBilling: "Billing",
  navNotifications: "Notifications",
  navVoiceAgent: "AI Voice Agent",
  navSettings: "General Settings",

  // Voice Agent page
  voiceAgentTitle: "AI Voice Agent",
  voiceAgentDescription: "Customize how your AI receptionist greets and sounds to callers.",
  greetingLabel: "Greeting Message",
  greetingHint: "What the AI says when it first answers a call. Leave blank to use the default greeting.",
  maxCallLabel: "Maximum Call Length",
  questionsLabel: "Questions",
  questionsHint: "Choose which details the receptionist collects. Anything turned off is not asked for or shown.",
  questionName: "Name",
  questionPhone: "Phone number",
  questionAddress: "Address",
  questionEmergency: "Is it an emergency?",
  questionNameDesc: "Ask for and save the caller's name.",
  questionPhoneDesc: "Automatically taken from the caller's number — the agent confirms it's the best callback number, or asks for a different one.",
  questionAddressDesc: "Ask for and save the caller's full address.",
  questionEmergencyDesc: "Detect urgent calls and flag them with a red Emergency badge.",
  maxCallHint: "The longest a single call can run before the AI automatically ends it, no matter how the call is going. Set it to Unlimited for no cap.",
  maxCallUnit: "min",
  maxCallUnlimited: "Unlimited",
  maxCallDecrease: "Decrease maximum call length",
  maxCallIncrease: "Increase maximum call length",
  maxCallPlaceholder: "No limit",
  voiceLabel: "Agent Voice",
  voiceHint: "Pick the voice your AI receptionist speaks with. Play a sample to hear each one.",
  playSample: "Play sample",
  pauseSample: "Pause",
  voiceSaved: "Saved",
  voiceCherry: "Cherry (warm female)",
  voiceEthan: "Ethan (friendly male)",
  voiceChelsie: "Chelsie (clear female)",
  voiceSerena: "Serena (calm female)",
  save: "Save",
  navigation: "Navigation",
  openMenu: "Open menu",
  signOut: "Sign out",
  loading: "Loading…",
  planLabel: "{plan} plan",

  // Idle session timeout
  idleTitle: "Still there?",
  idleDescription: "You've been inactive for a while. For your security you'll be signed out automatically when the timer runs out.",
  idleStay: "Stay signed in",
  idleLogoutNow: "Log out now",

  // Overview page
  overviewTitle: "Overview",
  overviewWelcome: "Welcome back!",
  loadFailed: "Failed to load dashboard.",
  tryAgain: "Try again",
  currentPlan: "Current Plan",
  minutesPerMonth: "{minutes} min/mo",
  minutesUsedThisPeriod: "{used} of {total} minutes used this period",
  upgradeTo: "Upgrade to {plan}",
  managePlan: "Manage plan",
  recentCalls: "Recent Calls",
  viewAll: "View all",
  noCalls: "No calls yet. Your AI receptionist is ready to go.",

  // Metric cards
  callsAnswered: "Calls Answered",
  avgCallDuration: "Avg Call Duration",
  minutesRemaining: "Minutes Remaining",
  secondsSuffix: "sec",

  // Minute usage widget
  minuteUsage: "Minute Usage",
  billingPeriod: "Billing period: {period}",
  statusOverLimit: "Over Limit",
  statusNearLimit: "Near Limit",
  statusHealthy: "Healthy Usage",
  minutesUsedLabel: "Minutes Used",
  ofTotal: "of {total}",
  statUsed: "Used",
  statRemaining: "Remaining",
  statUsedPct: "Used %",
  includedMinutesRemaining: "{remaining} of {total} included minutes remaining",
  changePlan: "Change Plan",

  // Upgrade card
  upgradeHeading: "Upgrade to {plan} to enable {feature}",
  upgradeSubtext: "This feature is available on the {plan} plan and above.",

  // Status badges
  statusAnswered: "Answered",
  statusCompleted: "Completed",
  statusMissed: "Missed",
  statusFailed: "Failed",

  // Home page link
  homePage: "Home Page",

  // Unsaved-changes guard
  unsavedTitle: "Unsaved changes",
  unsavedMessage: "You have unsaved changes. Leave without saving?",
  unsavedLeave: "Leave without saving",
  unsavedStay: "Stay on page",
}

export default dashboard
