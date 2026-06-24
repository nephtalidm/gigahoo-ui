"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/dashboard/page-header"
import { ConversationHistoryTable } from "@/components/dashboard/call-history-table"
import { getConversations, type ConversationData } from "@/lib/api"
import { mapApiConversation, type Conversation } from "@/lib/data"
import { Loader2 } from "lucide-react"

export default function CallHistoryPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getConversations(1, 100)
      .then((page) => {
        setConversations(page.items.map(mapApiConversation))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Conversation History"
        description="Every conversation your AI receptionist handled. Select one for details."
      />
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ConversationHistoryTable conversations={conversations} />
      )}
    </div>
  )
}
