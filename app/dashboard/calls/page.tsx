import { PageHeader } from "@/components/dashboard/page-header"
import { CallHistoryTable } from "@/components/dashboard/call-history-table"
import { calls } from "@/lib/data"

export default function CallHistoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Call History"
        description="Every call your AI receptionist handled. Select a call for details."
      />
      <CallHistoryTable calls={calls} />
    </div>
  )
}
