"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/contexts/language-context"

// Pills for the tags the voice agent attached when the call ended (see Conversation.tags).
// Styled to read as INFORMATION, not alarm — unlike EmergencyBadge, which is deliberately red
// because it means someone needs help now. A spam guess must never look as urgent as an emergency.
const TAG_STYLES: Record<string, string> = {
  out_of_scope: "bg-amber-500/10 text-amber-600 dark:text-amber-500",
  possible_spam: "bg-muted text-muted-foreground",
}

export function CallTagBadges({ tags, className }: { tags: string[]; className?: string }) {
  const { t } = useTranslation()
  if (!tags.length) return null
  return (
    <>
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className={cn(TAG_STYLES[tag] ?? "bg-muted text-muted-foreground", className)}>
          {t(`calls.tag_${tag}`)}
        </Badge>
      ))}
    </>
  )
}
