const dashboard = {
  // Sidebar nav
  navOverview: "Aperçu",
  navCallHistory: "Historique des conversations",
  navOptionalFeatures: "Fonctionnalités optionnelles",
  navPlanBilling: "Forfait",
  navBilling: "Paiement",
  navNotifications: "Notifications",
  navVoiceAgent: "Agent vocal IA",
  navSettings: "Paramètres généraux",

  // Voice Agent page
  voiceAgentTitle: "Agent vocal IA",
  voiceAgentDescription: "Personnalisez la façon dont votre réceptionniste IA accueille les appelants et le son de sa voix.",
  greetingLabel: "Message d'accueil",
  greetingHint: "Ce que dit l'IA lorsqu'elle répond à un appel. Laissez vide pour utiliser le message par défaut.",
  maxCallLabel: "Durée maximale d'appel",
  questionsLabel: "Questions",
  questionsHint: "Choisissez les informations recueillies par la réceptionniste. Ce qui est désactivé n'est ni demandé ni affiché.",
  questionName: "Nom",
  questionPhone: "Numéro de téléphone",
  questionAddress: "Adresse",
  questionEmergency: "Est-ce une urgence ?",
  maxCallHint: "La durée maximale d'un appel avant que l'IA n'y mette fin automatiquement, quel que soit le déroulement de l'appel. Réglez sur « Illimité » pour ne fixer aucune limite.",
  maxCallUnit: "min",
  maxCallUnlimited: "Illimité",
  maxCallDecrease: "Réduire la durée maximale d'appel",
  maxCallIncrease: "Augmenter la durée maximale d'appel",
  maxCallPlaceholder: "Aucune limite",
  voiceLabel: "Voix de l'agent",
  voiceHint: "Choisissez la voix de votre réceptionniste IA. Écoutez un échantillon pour chacune.",
  playSample: "Écouter un échantillon",
  pauseSample: "Pause",
  voiceSaved: "Enregistré",
  voiceCherry: "Cherry (voix féminine chaleureuse)",
  voiceEthan: "Ethan (voix masculine amicale)",
  voiceChelsie: "Chelsie (voix féminine claire)",
  voiceSerena: "Serena (voix féminine posée)",
  save: "Enregistrer",
  navigation: "Navigation",
  openMenu: "Ouvrir le menu",
  signOut: "Se déconnecter",
  loading: "Chargement…",
  planLabel: "Forfait {plan}",

  // Idle session timeout
  idleTitle: "Toujours là ?",
  idleDescription: "Vous êtes inactif depuis un moment. Pour votre sécurité, vous serez déconnecté automatiquement à la fin du compte à rebours.",
  idleStay: "Rester connecté",
  idleLogoutNow: "Se déconnecter maintenant",

  // Overview page
  overviewTitle: "Aperçu",
  overviewWelcome: "Bon retour !",
  loadFailed: "Échec du chargement du tableau de bord.",
  tryAgain: "Réessayer",
  currentPlan: "Forfait actuel",
  minutesPerMonth: "{minutes} min/mois",
  minutesUsedThisPeriod: "{used} minutes sur {total} utilisées pour cette période",
  upgradeTo: "Passer à {plan}",
  managePlan: "Gérer le forfait",
  recentCalls: "Appels récents",
  viewAll: "Tout afficher",
  noCalls: "Aucun appel pour l'instant. Votre réceptionniste IA est prêt.",

  // Metric cards
  callsAnswered: "Appels répondus",
  avgCallDuration: "Durée moyenne des appels",
  minutesRemaining: "Minutes restantes",
  secondsSuffix: "s",

  // Minute usage widget
  minuteUsage: "Utilisation des minutes",
  billingPeriod: "Période de facturation : {period}",
  statusOverLimit: "Limite dépassée",
  statusNearLimit: "Proche de la limite",
  statusHealthy: "Utilisation saine",
  minutesUsedLabel: "Minutes utilisées",
  ofTotal: "sur {total}",
  statUsed: "Utilisées",
  statRemaining: "Restantes",
  statUsedPct: "% utilisé",
  includedMinutesRemaining: "{remaining} minutes incluses restantes sur {total}",
  changePlan: "Changer de forfait",

  // Upgrade card
  upgradeHeading: "Passez à {plan} pour activer {feature}",
  upgradeSubtext: "Cette fonctionnalité est disponible à partir du forfait {plan}.",

  // Status badges
  statusAnswered: "Répondu",
  statusCompleted: "Terminé",
  statusMissed: "Manqué",
  statusFailed: "Échoué",

  // Home page link
  homePage: "Page d'accueil",

  // Unsaved-changes guard
  unsavedTitle: "Modifications non enregistrées",
  unsavedMessage: "Vous avez des modifications non enregistrées. Quitter sans enregistrer ?",
  unsavedLeave: "Quitter sans enregistrer",
  unsavedStay: "Rester sur la page",
}

export default dashboard
