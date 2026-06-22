"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/dashboard/page-header"
import { BillingView } from "@/components/dashboard/billing-view"
import {
  getBillingSummary,
  getPlans,
  getInvoices,
  getPaymentMethod,
  type BillingSummary,
  type PlanData,
  type InvoiceData,
  type PaymentMethodData,
} from "@/lib/api"
import { Loader2 } from "lucide-react"

export default function BillingPage() {
  const [summary, setSummary] = useState<BillingSummary | null>(null)
  const [plans, setPlans] = useState<PlanData[]>([])
  const [invoices, setInvoices] = useState<InvoiceData[]>([])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getBillingSummary().then(setSummary).catch(() => {}),
      getPlans().then(setPlans).catch(() => {}),
      getInvoices().then(setInvoices).catch(() => {}),
      getPaymentMethod().then(setPaymentMethod).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Plan & Billing" description="Manage your subscription, usage, and payment details." />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Plan & Billing" description="Manage your subscription, usage, and payment details." />
      <BillingView
        summary={summary}
        plans={plans}
        invoices={invoices}
        paymentMethod={paymentMethod}
      />
    </div>
  )
}
