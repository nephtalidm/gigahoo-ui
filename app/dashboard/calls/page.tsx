"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/dashboard/page-header"
import { CallHistoryTable } from "@/components/dashboard/call-history-table"
import { getCalls, type CallData } from "@/lib/api"
import { mapApiCall, type Call } from "@/lib/data"
import { Loader2 } from "lucide-react"

export default function CallHistoryPage() {
  const [calls, setCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCalls(1, 100)
      .then((page) => {
        setCalls(page.items.map(mapApiCall))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Call History"
        description="Every call your AI receptionist handled. Select a call for details."
      />
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <CallHistoryTable calls={calls} />
      )}
    </div>
  )
}
