import * as React from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { SearchIcon } from "lucide-react"

import { contactColumns } from "@/components/contact/columns"
import { DataTable } from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchContactSubmissions } from "@/lib/api/contact"
import { pageHead } from "@/lib/head"

type ContactSearch = {
  page: number
  q: string
}

export const Route = createFileRoute("/forms/contact/")({
  validateSearch: (search): ContactSearch => ({
    page:
      typeof search.page === "number" &&
      Number.isSafeInteger(search.page) &&
      search.page > 0
        ? search.page
        : 1,
    q: typeof search.q === "string" ? search.q.slice(0, 100) : "",
  }),
  head: () => pageHead("Contact submissions"),
  component: ContactSubmissionsPage,
})

function ContactSubmissionsPage() {
  const { page, q } = Route.useSearch()
  const navigate = Route.useNavigate()
  const submissions = useQuery({
    queryKey: ["contact-submissions", page, q],
    queryFn: () => fetchContactSubmissions(page, q),
    placeholderData: keepPreviousData,
  })

  function submitSearch(event: React.FormEvent) {
    event.preventDefault()
    const form = new FormData(event.currentTarget as HTMLFormElement)
    const search = String(form.get("q") ?? "").trim()
    void navigate({ search: { page: 1, q: search } })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold uppercase">
          Contact submissions
        </h1>
        <p className="text-sm text-muted-foreground">
          Review messages submitted through the website contact form.
        </p>
      </div>

      <form className="flex max-w-lg gap-2" onSubmit={submitSearch}>
        <Input
          key={q}
          name="q"
          defaultValue={q}
          placeholder="Search name, email, or topic"
          aria-label="Search contact submissions"
        />
        <Button type="submit" variant="outline">
          <SearchIcon data-icon="inline-start" />
          Search
        </Button>
      </form>

      {submissions.isPending ? (
        <div className="space-y-3" aria-label="Loading submissions">
          <Skeleton className="h-10 w-full rounded-none" />
          <Skeleton className="h-72 w-full rounded-none" />
        </div>
      ) : submissions.isError ? (
        <div className="border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {submissions.error.message}
        </div>
      ) : (
        <>
          <div className={submissions.isFetching ? "opacity-70" : undefined}>
            <DataTable
              columns={contactColumns}
              data={submissions.data.items}
              showPagination={false}
              onRowClick={(submission) => {
                void navigate({
                  to: "/forms/contact/$submissionId",
                  params: { submissionId: submission.id },
                })
              }}
              getRowLabel={(submission) =>
                `View submission from ${submission.first_name} ${submission.last_name}`
              }
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {submissions.data.total === 0
                ? "No submissions found."
                : `Page ${submissions.data.page} of ${submissions.data.totalPages} · ${submissions.data.total} submissions`}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || submissions.isFetching}
                onClick={() =>
                  void navigate({ search: { page: page - 1, q } })
                }
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={
                  page >= submissions.data.totalPages || submissions.isFetching
                }
                onClick={() =>
                  void navigate({ search: { page: page + 1, q } })
                }
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
