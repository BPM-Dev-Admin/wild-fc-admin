import { Badge } from "@/components/ui/badge"
import { formatStatus } from "@/lib/format"

export function StatusBadge({ value }: { value: string | null }) {
  if (!value || value === "not_required") {
    return <span className="text-muted-foreground">Not required</span>
  }

  const variant = value === "failed"
    ? "destructive"
    : value === "sent" || value === "synced" || value === "succeeded"
      ? "secondary"
      : "outline"

  return (
    <Badge variant={variant} className="capitalize">
      {formatStatus(value)}
    </Badge>
  )
}
