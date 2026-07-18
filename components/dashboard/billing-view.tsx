"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Elements } from "@stripe/react-stripe-js"
import { StripeCardPayForm, stripePromise } from "@/components/stripe-card-form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/toaster"
import { useTranslation } from "@/contexts/language-context"
import {
  changePlan,
  subscribePlan,
  getPaymentMethods,
  type PaymentMethod,
  getAccount,
  getPublicPrices,
  type BillingSummary,
  type PlanData,
  type InvoiceData,
} from "@/lib/api"
import { formatDate } from "@/lib/data"
import { ArrowUpRight, Check, Download, Loader2 } from "lucide-react"

export function BillingView({
  summary,
  plans,
  invoices,
}: {
  summary: BillingSummary | null
  plans: PlanData[]
  invoices: InvoiceData[]
}) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  // Embedded payment modal (no saved card): mounted once we hold a PaymentIntent clientSecret.
  const [payClientSecret, setPayClientSecret] = useState<string | null>(null)
  // The modal opens INSTANTLY in a preparing state when an upgrade starts — card lookup +
  // Stripe subscription creation take several seconds, and silence reads as a dead click.
  const [payPreparing, setPayPreparing] = useState(false)
  // Charging a SAVED card is never silent: the user confirms plan + price + card first.
  const [confirmTarget, setConfirmTarget] = useState<{ plan: PlanData; card: PaymentMethod } | null>(null)
  // Billing currency/amounts follow the ACCOUNT's country (where they signed up),
  // NOT the top-menu country/language switcher. Fetched fresh from the DB each load
  // (no caching); the price and its currency label render together once loaded.
  const [currency, setCurrency] = useState<string | null>(null)
  const [prices, setPrices] = useState<Record<string, string>>({})
  const { toast } = useToast()
  const router = useRouter()
  // Deep-link: /dashboard/plan?upgrade=Starter (the dashboard's Upgrade button) starts the
  // embedded flow for that plan immediately — this page is the fallback view, not a detour.
  // The param is consumed once and stripped so a refresh can't restart the flow.
  const autoUpgradeDone = useRef(false)
  useEffect(() => {
    if (autoUpgradeDone.current) return
    const name = new URLSearchParams(window.location.search).get("upgrade")
    if (!name) return
    const plan = plans.find((pl) => pl.name === name && pl.priceMonthly > 0)
    if (!plan) return
    autoUpgradeDone.current = true
    window.history.replaceState(null, "", "/dashboard/plan")
    void handleChangePlan(plan)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans])
  const { t } = useTranslation()

  useEffect(() => {
    // Tie plan prices/currency to the account's own country (not the switcher):
    // fetch the account, then the per-currency public prices for its country.
    getAccount()
      .then((account) => getPublicPrices((account.countryCode || "").toUpperCase()))
      .then((data) => {
        const map: Record<string, string> = {}
        for (const p of data.plans) {
          map[p.slug] = `$${Math.round(p.amount)}`
        }
        setPrices(map)
        if (data.currency) setCurrency(data.currency)
      })
      .catch(() => {})
  }, [])

  // Translated plan name / description / feature bullets keyed by plan slug —
  // identical to components/pricing.tsx so the dashboard cards match the public
  // homepage in every language (replaces the API's hardcoded English features).
  const planContent: Record<string, { name: string; description: string; features: string[] }> = {
    Free: {
      name: t("home.pricingFreeName"),
      description: t("home.pricingFreeDescription"),
      features: [
        t("home.pricingFreeFeature1"),
        t("home.pricingFreeFeature2"),
        t("home.pricingFreeFeature3"),
        t("home.pricingFreeFeature4"),
        t("home.pricingFreeFeature5"),
      ],
    },
    Starter: {
      name: t("home.pricingStarterName"),
      description: t("home.pricingStarterDescription"),
      features: [t("home.pricingStarterFeature1")],
    },
    Business: {
      name: t("home.pricingBusinessName"),
      description: t("home.pricingBusinessDescription"),
      features: [
        t("home.pricingBusinessFeature1"),
        t("home.pricingBusinessFeatureConcurrent"),
        t("home.pricingBusinessFeature2"),
      ],
    },
  }

  const currentPlan = summary?.plan ?? "Free"
  // Plan ordering is data-driven (Plan.DisplayOrder from the API), not a hardcoded list.
  const currentPlanOrder = plans.find((p) => p.name === currentPlan)?.displayOrder ?? 0
  const onFreePlan = currentPlan === "Free"
  const includedMinutes = summary?.includedMinutes ?? 25
  const minutesUsed = summary?.minutesUsed ?? 0
  const remaining = summary?.remainingMinutes ?? Math.max(includedMinutes - minutesUsed, 0)
  const usagePct = summary?.usagePercent ?? 0
  const billingPeriod = summary?.billingPeriod ?? ""

  async function handleChangePlan(plan: PlanData) {
    if (plan.priceMonthly === 0) {
      // Free plan — switch directly
      setLoadingPlan(plan.name)
      try {
        await changePlan(plan.id)
        window.location.reload()
      } catch {
        toast({ title: t("billing.changePlanFailed"), description: t("billing.tryAgain"), variant: "destructive" })
      } finally {
        setLoadingPlan(null)
      }
      return
    }

    setLoadingPlan(plan.name)
    try {
      // Charging a saved card is never silent — surface plan, price and card, and wait for an
      // explicit confirm. With no saved card the card-entry modal is itself the confirmation.
      setPayPreparing(true)
      const methods = await getPaymentMethods().catch(() => [] as PaymentMethod[])
      const defaultCard = methods.find((m) => m.isDefault) ?? methods[0]
      if (defaultCard) {
        setPayPreparing(false) // the confirm dialog takes over
        setConfirmTarget({ plan, card: defaultCard })
        setLoadingPlan(null)
        return
      }
      await startSubscribe(plan)
    } catch {
      setPayPreparing(false)
      toast({ title: t("billing.checkoutFailed"), description: t("billing.tryAgain"), variant: "destructive" })
    } finally {
      setLoadingPlan(null)
    }
  }

  // The actual subscribe call — reached directly (no saved card) or via the confirm dialog.
  async function startSubscribe(plan: PlanData) {
    setLoadingPlan(plan.name)
    try {
      // EMBEDDED upgrade: the saved default card is charged server-side; the dashboard is
      // never left. Only a 3DS challenge or a missing card needs anything further here.
      const res = await subscribePlan(plan.id)
      if (res.status === "active") {
        window.location.reload()
      } else if (res.status === "requires_action" && res.clientSecret) {
        const stripe = await stripePromise
        const { error } = await stripe!.confirmCardPayment(res.clientSecret)
        if (error) {
          setPayPreparing(false)
          toast({ title: t("billing.checkoutFailed"), description: error.message ?? t("billing.tryAgain"), variant: "destructive" })
        } else {
          window.location.reload()
        }
      } else if (res.clientSecret) {
        setPayClientSecret(res.clientSecret) // no saved card — collect one in the modal
        setPayPreparing(false)
      } else {
        setPayPreparing(false)
        toast({ title: t("billing.checkoutFailed"), description: t("billing.tryAgain"), variant: "destructive" })
      }
    } catch {
      setPayPreparing(false)
      toast({ title: t("billing.checkoutFailed"), description: t("billing.tryAgain"), variant: "destructive" })
    } finally {
      setLoadingPlan(null)
    }
  }


  return (
    <div className="flex flex-col gap-6">
      {/* Usage summary */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("billing.currentPlan")}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">{currentPlan}</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {t("billing.minutesPerMonth", { minutes: includedMinutes.toLocaleString() })}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{t("billing.billingCycle", { period: billingPeriod })}</p>
        </div>

        <Separator className="my-5" />

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("billing.minutesUsed")}</p>
            <p className="mt-1 text-xl font-bold text-foreground">{minutesUsed.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("billing.includedMinutes")}</p>
            <p className="mt-1 text-xl font-bold text-foreground">{includedMinutes.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("billing.remaining")}</p>
            <p className="mt-1 text-xl font-bold text-foreground">{remaining.toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${usagePct}%` }} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{t("billing.usedThisCycle", { percent: usagePct })}</p>
        </div>
      </div>

      {/* Plan selection */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">{t("billing.choosePlan")}</h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.name === currentPlan
            const isUpgrade = plan.displayOrder > currentPlanOrder
            const isLoading = loadingPlan === plan.name
            // Translated name/description/features + per-currency DB price,
            // keyed off plan.name ("Free"/"Starter"/"Business"). Falls back to
            // the API values if a plan slug is unknown.
            const content = planContent[plan.name]
            const displayName = content?.name ?? plan.name
            const displayFeatures = content?.features ?? plan.features
            const isFree = plan.priceMonthly === 0
            // Show the amount only once its currency is known, so price + currency
            // label appear together (no "price first, label later" flicker).
            const priceReady = isFree || (currency !== null && prices[plan.name] !== undefined)
            const displayPrice = prices[plan.name] ?? (isFree ? "$0" : "")
            return (
              <div
                key={plan.name}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-card p-7 shadow-sm",
                  isCurrent ? "border-primary ring-1 ring-primary" : "border-border",
                )}
              >
                {isCurrent && (
                  <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    {t("billing.currentPlanBadge")}
                  </span>
                )}
                <h3 className="text-lg font-semibold text-foreground">{displayName}</h3>
                <div className="mt-3 flex h-10 items-baseline gap-1">
                  {priceReady ? (
                    <>
                      <span className="text-4xl font-bold tracking-tight text-foreground">
                        {displayPrice}
                      </span>
                      {!isFree && currency && (
                        <span className="text-sm font-medium text-muted-foreground">{currency}</span>
                      )}
                      <span className="text-sm text-muted-foreground">{t("billing.perMonth")}</span>
                    </>
                  ) : (
                    <span className="h-9 w-24 animate-pulse rounded-md bg-muted" aria-hidden />
                  )}
                </div>
                {content?.description && (
                  <p className="mt-3 text-sm text-muted-foreground">{content.description}</p>
                )}
                <ul className="mt-6 flex-1 space-y-3">
                  {displayFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleChangePlan(plan)}
                  disabled={isCurrent || isLoading}
                  variant={isCurrent ? "outline" : isUpgrade ? "default" : "outline"}
                  size="lg"
                  className="mt-8 w-full"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isCurrent ? t("billing.currentPlanBadge") : isUpgrade ? t("billing.upgradeTo", { plan: displayName }) : t("billing.switchTo", { plan: displayName })}
                </Button>
              </div>
            )
          })}
          {plans.length === 0 && (
            <p className="col-span-3 text-center text-sm text-muted-foreground">{t("billing.noPlans")}</p>
          )}
        </div>
      </div>

      {/* Payment & Subscription + Billing History — hidden on the free plan */}
      {!onFreePlan && (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-semibold text-foreground">{t("billing.paymentSubscription")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("billing.paymentDescription")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="default" onClick={() => router.push("/dashboard/billing")}>
              {t("billing.managePaymentMethods")}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-semibold text-foreground">{t("billing.billingHistory")}</h2>
          {invoices.length > 0 ? (
            <ul className="mt-4 divide-y divide-border">
              {invoices.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{formatDate(inv.dateUtc)}</p>
                    <p className="text-xs text-muted-foreground">{inv.invoiceNumber}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className={cn(
                        inv.status === "paid"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : inv.status === "open"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-destructive/10 text-destructive",
                      )}
                    >
                      {inv.status}
                    </Badge>
                    <span className="text-sm font-medium text-foreground">
                      {inv.currency} {inv.amount.toFixed(2)}
                    </span>
                    {inv.pdfUrl && (
                      <a
                        href={inv.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t("billing.downloadInvoice", { number: inv.invoiceNumber })}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">{t("billing.noInvoices")}</p>
          )}
        </div>
      </div>
      )}
      {payPreparing && !payClientSecret && !confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 shadow-lg">
            <h2 className="text-lg font-semibold text-foreground">{t("billing.completeUpgrade")}</h2>
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </div>
      )}
      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
            <h2 className="mb-2 text-lg font-semibold text-foreground">{t("billing.confirmUpgradeTitle")}</h2>
            <p className="mb-5 text-sm text-muted-foreground">
              {t("billing.confirmUpgradeText", {
                plan: confirmTarget.plan.name,
                price: prices[confirmTarget.plan.name] ?? `$${Math.round(confirmTarget.plan.priceMonthly)}`,
                brand: confirmTarget.card.brand,
                last4: confirmTarget.card.last4,
              })}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground cursor-pointer transition-colors hover:bg-accent"
              >
                {t("billing.cancel")}
              </button>
              <button
                type="button"
                disabled={loadingPlan !== null}
                onClick={() => { const plan = confirmTarget.plan; setConfirmTarget(null); void startSubscribe(plan) }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm cursor-pointer transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {loadingPlan !== null && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("billing.confirmCharge")}
              </button>
            </div>
          </div>
        </div>
      )}
      {payClientSecret && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-foreground">{t("billing.completeUpgrade")}</h2>
            <Elements stripe={stripePromise} options={{ clientSecret: payClientSecret }}>
              <StripeCardPayForm
                submitLabel={t("billing.pay")}
                onSuccess={() => window.location.reload()}
                onCancel={() => setPayClientSecret(null)}
              />
            </Elements>
          </div>
        </div>
      )}
    </div>
  )
}
