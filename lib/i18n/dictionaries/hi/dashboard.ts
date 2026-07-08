const dashboard = {
  // Sidebar nav
  navOverview: "अवलोकन",
  navCallHistory: "वार्तालाप इतिहास",
  navOptionalFeatures: "वैकल्पिक विशेषताएँ",
  navPlanBilling: "प्लान",
  navBilling: "भुगतान",
  navNotifications: "सूचनाएँ",
  navVoiceAgent: "AI वॉइस एजेंट",
  navSettings: "सामान्य सेटिंग्स",

  // Voice Agent page
  voiceAgentTitle: "AI वॉइस एजेंट",
  voiceAgentDescription: "अपने AI रिसेप्शनिस्ट के कॉल करने वालों का अभिवादन करने के तरीके और आवाज़ को अनुकूलित करें।",
  greetingLabel: "अभिवादन संदेश",
  greetingHint: "कॉल का जवाब देते समय AI सबसे पहले क्या कहता है। डिफ़ॉल्ट अभिवादन उपयोग करने के लिए खाली छोड़ें।",
  maxCallLabel: "अधिकतम कॉल अवधि",
  questionsLabel: "प्रश्न",
  questionsHint: "चुनें कि रिसेप्शनिस्ट कौन-सी जानकारी एकत्र करे। बंद किए गए न पूछे न दिखाए जाएंगे।",
  questionName: "नाम",
  questionPhone: "फ़ोन नंबर",
  questionAddress: "पता",
  questionEmergency: "क्या यह आपातकाल है?",
  maxCallHint: "AI द्वारा कॉल को स्वतः समाप्त करने से पहले एक कॉल अधिकतम कितनी देर चल सकती है, चाहे कॉल कैसी भी चल रही हो। कोई सीमा न रखने के लिए इसे 'असीमित' पर सेट करें।",
  maxCallUnit: "मिनट",
  maxCallUnlimited: "असीमित",
  maxCallDecrease: "अधिकतम कॉल अवधि घटाएँ",
  maxCallIncrease: "अधिकतम कॉल अवधि बढ़ाएँ",
  maxCallPlaceholder: "कोई सीमा नहीं",
  voiceLabel: "एजेंट की आवाज़",
  voiceHint: "वह आवाज़ चुनें जिसमें आपका AI रिसेप्शनिस्ट बोलता है। हर एक को सुनने के लिए नमूना चलाएँ।",
  playSample: "नमूना चलाएँ",
  pauseSample: "रोकें",
  voiceSaved: "सहेजा गया",
  voiceCherry: "Cherry (गर्मजोश महिला)",
  voiceEthan: "Ethan (मित्रवत पुरुष)",
  voiceChelsie: "Chelsie (स्पष्ट महिला)",
  voiceSerena: "Serena (शांत महिला)",
  save: "सहेजें",
  navigation: "नेविगेशन",
  openMenu: "मेनू खोलें",
  signOut: "साइन आउट करें",
  loading: "लोड हो रहा है…",
  planLabel: "{plan} प्लान",

  // Idle session timeout
  idleTitle: "क्या आप अब भी यहाँ हैं?",
  idleDescription: "आप कुछ समय से निष्क्रिय हैं। आपकी सुरक्षा के लिए, टाइमर समाप्त होने पर आपको स्वतः साइन आउट कर दिया जाएगा।",
  idleStay: "साइन इन बने रहें",
  idleLogoutNow: "अभी लॉग आउट करें",

  // Overview page
  overviewTitle: "अवलोकन",
  overviewWelcome: "वापस स्वागत है!",
  loadFailed: "डैशबोर्ड लोड करने में विफल।",
  tryAgain: "पुनः प्रयास करें",
  currentPlan: "वर्तमान प्लान",
  minutesPerMonth: "{minutes} मिनट/माह",
  minutesUsedThisPeriod: "इस अवधि में {total} में से {used} मिनट उपयोग हुए",
  upgradeTo: "{plan} में अपग्रेड करें",
  managePlan: "प्लान प्रबंधित करें",
  recentCalls: "हाल की कॉल",
  viewAll: "सभी देखें",
  noCalls: "अभी तक कोई कॉल नहीं। आपका AI रिसेप्शनिस्ट तैयार है।",

  // Metric cards
  callsAnswered: "उत्तर दी गई कॉल",
  avgCallDuration: "औसत कॉल अवधि",
  minutesRemaining: "शेष मिनट",
  secondsSuffix: "सेकंड",

  // Minute usage widget
  minuteUsage: "मिनट उपयोग",
  billingPeriod: "बिलिंग अवधि: {period}",
  statusOverLimit: "सीमा से अधिक",
  statusNearLimit: "सीमा के निकट",
  statusHealthy: "स्वस्थ उपयोग",
  minutesUsedLabel: "उपयोग किए गए मिनट",
  ofTotal: "{total} में से",
  statUsed: "उपयोग किए गए",
  statRemaining: "शेष",
  statUsedPct: "उपयोग %",
  includedMinutesRemaining: "शामिल {total} में से {remaining} मिनट शेष",
  changePlan: "प्लान बदलें",

  // Upgrade card
  upgradeHeading: "{feature} सक्षम करने के लिए {plan} में अपग्रेड करें",
  upgradeSubtext: "यह विशेषता {plan} प्लान और उससे ऊपर पर उपलब्ध है।",

  // Status badges
  statusAnswered: "उत्तर दिया गया",
  statusCompleted: "पूर्ण",
  statusMissed: "छूट गई",
  statusFailed: "विफल",

  // Home page link
  homePage: "मुख्य पृष्ठ",

  // Unsaved-changes guard
  unsavedTitle: "असहेजे गए बदलाव",
  unsavedMessage: "आपके पास असहेजे गए बदलाव हैं। बिना सहेजे छोड़ें?",
  unsavedLeave: "बिना सहेजे छोड़ें",
  unsavedStay: "पेज पर बने रहें",
}

export default dashboard
