"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/toaster"
import { useTranslation } from "@/contexts/language-context"
import {
  changePlan,
  createBillingPortal,
  createCheckout,
  getCurrencyForVisitor,
  type BillingSummary,
  type PlanData,
  type InvoiceData,
} from "@/lib/api"
import { formatDate } from "@/lib/data"
import { ArrowUpRight, Check, Download, Loader2 } from "lucide-react"

const planOrder = ["Free", "Starter", "Business"]

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
  const [portalLoading, setPortalLoading] = useState(false)
  // Billing currency for the plan amounts. The summary/plan data carries no
  // currency, so (like the homepage Pricing) resolve it from the visitor's geo
  // country (Country.Currency via the API). Initialized from the NEXT_CURRENCY
  // cookie so it renders immediately without a flicker.
  const [currency, setCurrency] = useState<string | null>(() =>
    typeof document !== "undefined"
      ? (document.cookie.match(/(?:^|;\s*)NEXT_CURRENCY=([^;]+)/)?.[1] ?? null)
      : null,
  )
  const { toast } = useToast()
  const { t } = useTranslation()

  useEffect(() => {
    // Only fetch when the NEXT_CURRENCY cookie isn't already present; cache the
    // result so subsequent renders have it synchronously.
    const cached = document.cookie.match(/(?:^|;\s*)NEXT_CURRENCY=([^;]+)/)?.[1]
    if (cached) return
    const country = (document.cookie.match(/(?:^|;\s*)NEXT_COUNTRY=([^;]+)/)?.[1] ?? "").toUpperCase()
    getCurrencyForVisitor(country)
      .then((c) => {
        if (c.currency) {
          setCurrency(c.currency)
          document.cookie = `NEXT_CURRENCY=${c.currency};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`
        }
      })
      .catch(() => {})
  }, [])

  const currentPlan = summary?.plan ?? "Free"
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
      const { url } = await createCheckout(plan.id)
      window.location.href = url
    } catch {
      toast({ title: t("billing.checkoutFailed"), description: t("billing.tryAgain"), variant: "destructive" })
    } finally {
      setLoadingPlan(null)
    }
  }

  async function handleOpenPortal() {
    setPortalLoading(true)
    try {
      const { url } = await createBillingPortal()
      window.open(url, "_blank")
    } catch {
      toast({ title: t("billing.portalFailed"), description: t("billing.tryAgain"), variant: "destructive" })
    } finally {
      setPortalLoading(false)
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
          <p className="mt-2 text-xs text-muted-foreground">{t("billing.usedThisCycle", { percent: usagePct })}</p>
        </div>
      </div>

      {/* Plan selection */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">{t("billing.choosePlan")}</h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.name === currentPlan
            const isUpgrade = planOrder.indexOf(plan.name) > planOrder.indexOf(currentPlan)
            const isLoading = loadingPlan === plan.name
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
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    ${plan.priceMonthly}
                  </span>
                  {plan.priceMonthly !== 0 && currency && (
                    <span className="text-sm font-medium text-muted-foreground">{currency}</span>
                  )}
                  <span className="text-sm text-muted-foreground">{t("billing.perMonth")}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
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
                  {isCurrent ? t("billing.currentPlanBadge") : isUpgrade ? t("billing.upgradeTo", { plan: plan.name }) : t("billing.switchTo", { plan: plan.name })}
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
            <Button variant="default" onClick={handleOpenPortal} disabled={portalLoading}>
              {portalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("billing.openBillingPortal")}
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
    </div>
  )
}
