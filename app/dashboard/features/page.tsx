import { PageHeader } from "@/components/dashboard/page-header"
import { OptionalFeatures } from "@/components/dashboard/optional-features"
import { account } from "@/lib/data"

export default function FeaturesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Optional Features"
        description="Configure premium features for your AI receptionist."
      />
      <OptionalFeatures plan={account.plan} />
    </div>
  )
}
