import { PageHeader } from "@/components/dashboard/page-header"
import { BillingView } from "@/components/dashboard/billing-view"

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Plan & Billing"
        description="Manage your subscription, usage, and payment details."
      />
      <BillingView />
    </div>
  )
}
