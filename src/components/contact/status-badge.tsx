import { Badge } from "@/components/ui/badge"
import { formatStatus } from "@/lib/format"

export function StatusBadge({ value }: { value: string | null }) {
  if (!value) {
    return <span className="text-muted-foreground">Not requested</span>
  }

  const variant = value === "failed"
    ? "destructive"
    : value === "sent" || value === "synced"
      ? "secondary"
      : "outline"

  return (
    <Badge variant={variant} className="capitalize">
      {formatStatus(value)}
    </Badge>
  )
}
