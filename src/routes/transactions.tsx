import { createFileRoute } from "@tanstack/react-router"

import { DataTable } from "@/components/data-table/data-table"
import { columns } from "@/components/transactions/columns"
import { transactions } from "@/components/transactions/data"
import { pageHead } from "@/lib/head"

export const Route = createFileRoute("/transactions")({
  head: () => pageHead("Transactions"),
  component: TransactionsPage,
})

function TransactionsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold">Transactions</h1>
      <DataTable
        columns={columns}
        data={transactions}
        filterColumnId="description"
        filterPlaceholder="Filter descriptions..."
      />
    </div>
  )
}
