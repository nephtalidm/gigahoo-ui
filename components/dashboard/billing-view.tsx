"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/toaster"
import {
  changePlan,
  createBillingPortal,
  type BillingSummary,
  type PlanData,
  type InvoiceData,
  type PaymentMethodData,
} from "@/lib/api"
import { formatDate } from "@/lib/data"
import { Check, CreditCard, ArrowUpRight, Download, Loader2 } from "lucide-react"

const planOrder = ["Free", "Starter", "Business"]

export function BillingView({
  summary,
  plans,
  invoices,
  paymentMethod,
}: {
  summary: BillingSummary | null
  plans: PlanData[]
  invoices: InvoiceData[]
  paymentMethod: PaymentMethodData | null
}) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const { toast } = useToast()

  const currentPlan = summary?.plan ?? "Free"
  const includedMinutes = summary?.includedMinutes ?? 25
  const minutesUsed = summary?.minutesUsed ?? 0
  const remaining = summary?.remainingMinutes ?? Math.max(includedMinutes - minutesUsed, 0)
  const usagePct = summary?.usagePercent ?? 0
  const billingPeriod = summary?.billingPeriod ?? ""

  async function handleChangePlan(plan: PlanData) {
    setLoadingPlan(plan.name)
    try {
      await changePlan(plan.id)
      window.location.reload()
    } catch {
      toast({ title: "Failed to change plan", description: "Please try again.", variant: "destructive" })
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
      toast({ title: "Failed to open billing portal", description: "Please try again.", variant: "destructive" })
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
            <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">{currentPlan}</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {includedMinutes.toLocaleString()} min/mo
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Billing cycle: {billingPeriod}</p>
        </div>

        <Separator className="my-5" />

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Minutes Used</p>
            <p className="mt-1 text-xl font-bold text-foreground">{minutesUsed.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Included Minutes</p>
            <p className="mt-1 text-xl font-bold text-foreground">{includedMinutes.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Remaining</p>
            <p className="mt-1 text-xl font-bold text-foreground">{remaining.toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${usagePct}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{usagePct}% of included minutes used this cycle</p>
        </div>
      </div>

      {/* Plan selection */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">Choose your plan</h2>
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
                    Current plan
                  </span>
                )}
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    ${plan.priceMonthly}
                  </span>
                  <span className="text-sm text-muted-foreground">/month</span>
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
                  {isCurrent ? "Current plan" : isUpgrade ? `Upgrade to ${plan.name}` : `Switch to ${plan.name}`}
                </Button>
              </div>
            )
          })}
          {plans.length === 0 && (
            <p className="col-span-3 text-center text-sm text-muted-foreground">No plans available.</p>
          )}
        </div>
      </div>

      {/* Billing / Stripe section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-semibold text-foreground">Payment Method</h2>
          {paymentMethod ? (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CreditCard className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {paymentMethod.brand} ending in {paymentMethod.last4}
                </p>
                <p className="text-xs text-muted-foreground">
                  Expires {String(paymentMethod.expMonth).padStart(2, "0")}/{paymentMethod.expYear}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-border p-4 text-center">
              <p className="text-sm text-muted-foreground">No payment method on file</p>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleOpenPortal} disabled={portalLoading}>
              {portalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Manage Subscription
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-semibold text-foreground">Billing History</h2>
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
                        aria-label={`Download invoice ${inv.invoiceNumber}`}
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
            <p className="mt-4 text-sm text-muted-foreground">No invoices yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
