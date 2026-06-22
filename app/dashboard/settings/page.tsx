import { PageHeader } from "@/components/dashboard/page-header"
import { SettingsView } from "@/components/dashboard/settings-view"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Manage your business information."
      />
      <SettingsView />
    </div>
  )
}
