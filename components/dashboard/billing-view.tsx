"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  account,
  changePlan,
  updatePaymentMethod,
  openStripeCustomerPortal,
  PLAN_MINUTES,
  type Plan,
} from "@/lib/data"
import { Check, CreditCard, ArrowUpRight, Download } from "lucide-react"

const planDetails: {
  name: Plan
  price: string
  description: string
  features: string[]
}[] = [
  {
    name: "Free",
    price: "$0",
    description: "Everything you need to start answering calls.",
    features: [
      "24/7 AI receptionist",
      "Multilingual support",
      "Customer intake",
      "Call summaries",
      "25 included minutes",
    ],
  },
  {
    name: "Starter",
    price: "$49",
    description: "Everything in Free, plus:",
    features: ["250 included minutes"],
  },
  {
    name: "Business",
    price: "$99",
    description: "Everything in Starter, plus:",
    features: ["Answers questions about services", "1,000 included minutes"],
  },
]

const billingHistory = [
  { id: "inv-0006", date: "Jun 1, 2026", amount: "$99.00", status: "Paid" },
  { id: "inv-0005", date: "May 1, 2026", amount: "$99.00", status: "Paid" },
  { id: "inv-0004", date: "Apr 1, 2026", amount: "$99.00", status: "Paid" },
  { id: "inv-0003", date: "Mar 1, 2026", amount: "$49.00", status: "Paid" },
]

const planOrder: Plan[] = ["Free", "Starter", "Business"]

export function BillingView() {
  const [currentPlan, setCurrentPlan] = useState<Plan>(account.plan)
  const includedMinutes = PLAN_MINUTES[currentPlan]
  const remaining = Math.max(includedMinutes - account.minutesUsed, 0)
  const usagePct = Math.min(Math.round((account.minutesUsed / includedMinutes) * 100), 100)

  function handleChangePlan(plan: Plan) {
    setCurrentPlan(plan)
    changePlan(plan)
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
          <p className="text-sm text-muted-foreground">Billing cycle: {account.billingPeriod}</p>
        </div>

        <Separator className="my-5" />

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Minutes Used</p>
            <p className="mt-1 text-xl font-bold text-foreground">{account.minutesUsed.toLocaleString()}</p>
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
          {planDetails.map((plan) => {
            const isCurrent = plan.name === currentPlan
            const isUpgrade = planOrder.indexOf(plan.name) > planOrder.indexOf(currentPlan)
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
                  <span className="text-4xl font-bold tracking-tight text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>
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
                  onClick={() => handleChangePlan(plan.name)}
                  disabled={isCurrent}
                  variant={isCurrent ? "outline" : isUpgrade ? "default" : "outline"}
                  size="lg"
                  className="mt-8 w-full"
                >
                  {isCurrent ? "Current plan" : isUpgrade ? `Upgrade to ${plan.name}` : `Switch to ${plan.name}`}
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Billing / Stripe section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-semibold text-foreground">Payment Method</h2>
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Visa ending in 4242</p>
              <p className="text-xs text-muted-foreground">Expires 09/2028</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={updatePaymentMethod}>
              Update Payment Method
            </Button>
            <Button variant="ghost" className="gap-1.5" onClick={openStripeCustomerPortal}>
              Manage Subscription
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-semibold text-foreground">Billing History</h2>
          <ul className="mt-4 divide-y divide-border">
            {billingHistory.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{inv.date}</p>
                  <p className="text-xs text-muted-foreground">{inv.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                    {inv.status}
                  </Badge>
                  <span className="text-sm font-medium text-foreground">{inv.amount}</span>
                  <button
                    aria-label={`Download invoice ${inv.id}`}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
