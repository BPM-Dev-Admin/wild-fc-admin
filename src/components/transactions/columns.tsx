"use client"

import { createColumnHelper } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { DataTableFeatures } from "@/components/data-table/data-table-features"
import { ArrowUpDownIcon } from "lucide-react"

export type TransactionStatus = "cleared" | "pending" | "failed"

export type Transaction = {
  id: string
  date: string
  description: string
  category: string
  account: string
  status: TransactionStatus
  amount: number
}

const statusVariant: Record<
  TransactionStatus,
  "secondary" | "outline" | "destructive"
> = {
  cleared: "secondary",
  pending: "outline",
  failed: "destructive",
}

// Dates are date-only ISO strings, which parse as UTC midnight — format in
// UTC too, or western timezones render the previous day.
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  signDisplay: "exceptZero",
})

const columnHelper = createColumnHelper<DataTableFeatures, Transaction>()

export const columns = columnHelper.columns([
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}
        aria-label="Select all rows on this page"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(!!checked)}
        aria-label={`Select ${row.original.description}`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor("date", {
    header: "Date",
    cell: ({ getValue }) => dateFormatter.format(new Date(getValue())),
  }),
  columnHelper.accessor("description", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2.5"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Description
        <ArrowUpDownIcon data-icon="inline-end" />
      </Button>
    ),
  }),
  columnHelper.accessor("category", {
    header: "Category",
  }),
  columnHelper.accessor("account", {
    header: "Account",
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue()
      return (
        <Badge variant={statusVariant[status]} className="capitalize">
          {status}
        </Badge>
      )
    },
  }),
  columnHelper.accessor("amount", {
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          size="sm"
          className="-mr-2.5"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDownIcon data-icon="inline-end" />
        </Button>
      </div>
    ),
    cell: ({ getValue }) => (
      <div className="text-right font-medium tabular-nums">
        {currencyFormatter.format(getValue())}
      </div>
    ),
  }),
])
