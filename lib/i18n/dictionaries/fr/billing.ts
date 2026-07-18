const billing = {
  // Page header
  title: "Forfait et facturation",
  description: "Gérez votre abonnement, votre utilisation et vos informations de paiement.",

  // Usage summary
  currentPlan: "Forfait actuel",
  minutesPerMonth: "{minutes} min/mois",
  billingCycle: "Cycle de facturation : {period}",
  minutesUsed: "Minutes utilisées",
  includedMinutes: "Minutes incluses",
  remaining: "Restantes",
  usedThisCycle: "{percent} % des minutes incluses utilisées ce cycle",

  // Plan selection
  choosePlan: "Choisissez votre forfait",
  currentPlanBadge: "Forfait actuel",
  perMonth: "/mois",
  upgradeTo: "Passer à {plan}",
  switchTo: "Basculer vers {plan}",
  noPlans: "Aucun forfait disponible.",

  // Payment / Stripe
  paymentSubscription: "Paiement et abonnement",
  paymentDescription: "Gérez vos modes de paiement et votre abonnement via le portail de facturation Stripe.",
  openBillingPortal: "Ouvrir le portail de facturation",

  // Billing history
  billingHistory: "Historique de facturation",
  noInvoices: "Aucune facture pour l'instant.",
  downloadInvoice: "Télécharger la facture {number}",

  // Toasts
  changePlanFailed: "Échec du changement de forfait",
  checkoutFailed: "Échec du démarrage du paiement",
  portalFailed: "Échec de l'ouverture du portail de facturation",
  tryAgain: "Veuillez réessayer.",
  // Payment methods (embedded Stripe Elements)
  paymentMethodsTitle: "Paiement",
  paymentMethodsDescription: "Ajoutez et gérez les cartes utilisées pour payer votre abonnement.",
  addPaymentMethod: "Ajouter un moyen de paiement",
  addPaymentMethodHint: "Ajoutez une carte en toute sécurité. Vos données sont traitées par notre prestataire de paiement.",
  save: "Enregistrer la carte",
  cancel: "Annuler",
  remove: "Supprimer",
  defaultCard: "Par défaut",
  makeDefault: "Définir par défaut",
  removeConfirm: "Supprimer ce moyen de paiement ?",
  noPaymentMethods: "Aucun moyen de paiement enregistré pour le moment.",
  cardSaved: "Carte enregistrée",
  cardExpires: "Expire le {date}",
  cardError: "Impossible d'enregistrer votre carte. Veuillez réessayer.",
  pay: "Payer",
  completeUpgrade: "Finalisez votre changement de forfait",
  addCardFailed: "Impossible de lancer l'ajout d'une carte. Veuillez réessayer.",
  providerUnsupported: "Ce prestataire de paiement n'est pas encore pris en charge.",
}

export default billing
