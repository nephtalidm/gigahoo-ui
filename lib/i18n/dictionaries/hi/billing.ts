const billing = {
  // Page header
  title: "प्लान और बिलिंग",
  description: "अपनी सदस्यता, उपयोग और भुगतान विवरण प्रबंधित करें।",

  // Usage summary
  currentPlan: "वर्तमान प्लान",
  minutesPerMonth: "{minutes} मिनट/माह",
  billingCycle: "बिलिंग चक्र: {period}",
  minutesUsed: "उपयोग किए गए मिनट",
  includedMinutes: "शामिल मिनट",
  remaining: "शेष",
  usedThisCycle: "इस चक्र में शामिल मिनटों का {percent}% उपयोग हुआ",

  // Plan selection
  choosePlan: "अपना प्लान चुनें",
  currentPlanBadge: "वर्तमान प्लान",
  perMonth: "/माह",
  upgradeTo: "{plan} में अपग्रेड करें",
  switchTo: "{plan} पर स्विच करें",
  noPlans: "कोई प्लान उपलब्ध नहीं है।",

  // Payment / Stripe
  paymentSubscription: "भुगतान और सदस्यता",
  paymentDescription: "Stripe बिलिंग पोर्टल के माध्यम से अपने भुगतान तरीके और सदस्यता प्रबंधित करें।",
  openBillingPortal: "बिलिंग पोर्टल खोलें",

  // Billing history
  billingHistory: "बिलिंग इतिहास",
  noInvoices: "अभी तक कोई चालान नहीं।",
  downloadInvoice: "चालान {number} डाउनलोड करें",

  // Toasts
  changePlanFailed: "प्लान बदलने में विफल",
  checkoutFailed: "चेकआउट शुरू करने में विफल",
  portalFailed: "बिलिंग पोर्टल खोलने में विफल",
  tryAgain: "कृपया पुनः प्रयास करें।",
  // Payment methods (embedded Stripe Elements)
  paymentMethodsTitle: "भुगतान के तरीके",
  paymentMethodsDescription: "अपनी सदस्यता का भुगतान करने के लिए उपयोग किए जाने वाले कार्ड जोड़ें और प्रबंधित करें।",
  addPaymentMethod: "भुगतान विधि जोड़ें",
  addPaymentMethodHint: "नया कार्ड सुरक्षित रूप से जोड़ें। आपकी जानकारी हमारे भुगतान प्रदाता द्वारा संभाली जाती है।",
  save: "कार्ड सहेजें",
  cancel: "रद्द करें",
  remove: "हटाएँ",
  removeConfirm: "इस भुगतान विधि को हटाएँ?",
  noPaymentMethods: "अभी तक कोई भुगतान विधि सहेजी नहीं गई है।",
  cardSaved: "कार्ड सहेजा गया",
  cardExpires: "समाप्ति {date}",
  cardError: "आपका कार्ड सहेजा नहीं जा सका। कृपया पुनः प्रयास करें।",
  addCardFailed: "कार्ड जोड़ना शुरू नहीं किया जा सका। कृपया पुनः प्रयास करें।",
  providerUnsupported: "यह भुगतान प्रदाता अभी समर्थित नहीं है।",
}

export default billing
