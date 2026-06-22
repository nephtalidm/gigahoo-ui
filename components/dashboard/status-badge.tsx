import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const styles: Record<string, string> = {
  // Call statuses
  Answered: "bg-primary/10 text-primary",
  Completed: "bg-emerald-500/10 text-emerald-600",
  Missed: "bg-amber-500/10 text-amber-600",
  Failed: "bg-destructive/10 text-destructive",
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant="secondary" className={cn(styles[status] ?? "bg-secondary text-foreground", className)}>
      {status}
    </Badge>
  )
}
