"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/dashboard/page-header"
import { ConversationHistoryTable } from "@/components/dashboard/call-history-table"
import { getConversations, getAccount, type ConversationData } from "@/lib/api"
import { mapApiConversation, type Conversation } from "@/lib/data"
import { useTranslation } from "@/contexts/language-context"
import { Loader2 } from "lucide-react"

export default function CallHistoryPage() {
  const { t } = useTranslation()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [timeZone, setTimeZone] = useState<string | undefined>(undefined)
  const [questions, setQuestions] = useState<{ collectName: boolean; collectPhone: boolean; collectAddress: boolean; collectEmergency: boolean } | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch the account too so we can show call times in the ACCOUNT's timezone (its region),
    // consistent with the summary email — not the viewer's browser timezone.
    Promise.all([getConversations(1, 100), getAccount().catch(() => null)])
      .then(([page, account]) => {
        setConversations(page.items.map(mapApiConversation))
        if (account?.timeZone) setTimeZone(account.timeZone)
        if (account) setQuestions({
          collectName: account.collectName ?? true,
          collectPhone: account.collectPhone ?? true,
          collectAddress: account.collectAddress ?? true,
          collectEmergency: account.collectEmergency ?? true,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("calls.title")}
        description={t("calls.description")}
      />
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ConversationHistoryTable conversations={conversations} timeZone={timeZone} questions={questions} />
      )}
    </div>
  )
}
