const billing = {
  // Page header
  title: "Plan y facturación",
  description: "Administra tu suscripción, uso y datos de pago.",

  // Usage summary
  currentPlan: "Plan actual",
  minutesPerMonth: "{minutes} min/mes",
  billingCycle: "Ciclo de facturación: {period}",
  minutesUsed: "Minutos usados",
  includedMinutes: "Minutos incluidos",
  remaining: "Restantes",
  usedThisCycle: "{percent}% de los minutos incluidos usados en este ciclo",

  // Plan selection
  choosePlan: "Elige tu plan",
  currentPlanBadge: "Plan actual",
  perMonth: "/mes",
  upgradeTo: "Cambiar a {plan}",
  switchTo: "Cambiar a {plan}",
  noPlans: "No hay planes disponibles.",

  // Payment / Stripe
  paymentSubscription: "Pago y suscripción",
  paymentDescription: "Administra tus métodos de pago y tu suscripción a través del portal de facturación de Stripe.",
  openBillingPortal: "Abrir portal de facturación",

  // Billing history
  billingHistory: "Historial de facturación",
  noInvoices: "Aún no hay facturas.",
  downloadInvoice: "Descargar factura {number}",

  // Toasts
  changePlanFailed: "No se pudo cambiar el plan",
  checkoutFailed: "No se pudo iniciar el pago",
  portalFailed: "No se pudo abrir el portal de facturación",
  tryAgain: "Inténtalo de nuevo.",
  // Payment methods (embedded Stripe Elements)
  paymentMethodsTitle: "Pagos",
  paymentMethodsDescription: "Agrega y administra las tarjetas que usas para pagar tu suscripción.",
  addPaymentMethod: "Agregar método de pago",
  addPaymentMethodHint: "Agrega una tarjeta de forma segura. Tus datos los gestiona nuestro proveedor de pagos.",
  save: "Guardar tarjeta",
  cancel: "Cancelar",
  remove: "Eliminar",
  removeConfirm: "¿Eliminar este método de pago?",
  noPaymentMethods: "Aún no hay métodos de pago guardados.",
  cardSaved: "Tarjeta guardada",
  cardExpires: "Vence {date}",
  cardError: "No se pudo guardar tu tarjeta. Inténtalo de nuevo.",
  addCardFailed: "No se pudo iniciar el proceso para agregar una tarjeta. Inténtalo de nuevo.",
  providerUnsupported: "Este proveedor de pagos aún no es compatible.",
}

export default billing
