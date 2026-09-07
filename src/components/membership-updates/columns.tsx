import { createColumnHelper } from "@tanstack/react-table"

import { StatusBadge } from "@/components/status-badge"
import type { DataTableFeatures } from "@/components/data-table/data-table-features"
import { formatHelpTopics } from "@/components/membership-updates/format"
import type { MembershipUpdateListItem } from "@/lib/api/membership-updates"
import { formatSubmissionDate } from "@/lib/format"

const columnHelper = createColumnHelper<
  DataTableFeatures,
  MembershipUpdateListItem
>()

export const membershipUpdateColumns = columnHelper.columns([
  columnHelper.accessor("submitted_at", {
    header: "Submitted",
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {formatSubmissionDate(getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("full_name", {
    header: "Name",
    cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
  }),
  columnHelper.accessor("email", {
    header: "Email",
  }),
  columnHelper.accessor("stm_number", {
    header: "STM number",
    cell: ({ getValue }) => getValue() ?? "—",
  }),
  columnHelper.accessor("help_topics", {
    header: "Requested help",
    cell: ({ getValue }) => {
      const topics = formatHelpTopics(getValue())
      return topics.length > 1 ? `${topics[0]} +${topics.length - 1}` : topics[0] ?? "—"
    },
  }),
  columnHelper.accessor("notification_status", {
    header: "Notification",
    cell: ({ getValue }) => <StatusBadge value={getValue()} />,
  }),
])
