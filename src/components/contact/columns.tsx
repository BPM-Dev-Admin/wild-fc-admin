import { createColumnHelper } from "@tanstack/react-table"

import { StatusBadge } from "@/components/contact/status-badge"
import type { DataTableFeatures } from "@/components/data-table/data-table-features"
import type { ContactSubmissionListItem } from "@/lib/api/contact"
import { formatSubmissionDate } from "@/lib/format"

const columnHelper = createColumnHelper<
  DataTableFeatures,
  ContactSubmissionListItem
>()

export const contactColumns = columnHelper.columns([
  columnHelper.accessor("submitted_at", {
    header: "Submitted",
    cell: ({ getValue }) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {formatSubmissionDate(getValue())}
      </span>
    ),
  }),
  columnHelper.accessor((row) => `${row.first_name} ${row.last_name}`, {
    id: "name",
    header: "Name",
    cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
  }),
  columnHelper.accessor("email", {
    header: "Email",
  }),
  columnHelper.accessor("topic", {
    header: "Topic",
  }),
  columnHelper.accessor("email_status", {
    header: "Notification",
    cell: ({ getValue }) => <StatusBadge value={getValue()} />,
  }),
  columnHelper.accessor("sync_status", {
    header: "Newsletter",
    cell: ({ getValue }) => <StatusBadge value={getValue()} />,
  }),
])
