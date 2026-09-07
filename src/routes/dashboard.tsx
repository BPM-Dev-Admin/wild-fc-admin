import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowUpRightIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchMembershipUpdates } from "@/lib/api/membership-updates"
import { formatSubmissionDate } from "@/lib/format"
import { pageHead } from "@/lib/head"

export const Route = createFileRoute("/dashboard")({
  head: () => pageHead("Dashboard"),
  component: DashboardPage,
})

function DashboardPage() {
  const membershipUpdates = useQuery({
    queryKey: ["membership-updates", 1, ""],
    queryFn: () => fetchMembershipUpdates(1, ""),
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold uppercase">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Review submissions from website forms.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Link
          to="/forms/membership-updates"
          search={{ page: 1, q: "" }}
          className="group rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Card className="h-full transition-colors group-hover:bg-muted/50">
            <CardHeader className="grid-cols-[1fr_auto]">
              <CardTitle className="uppercase">Membership Updates</CardTitle>
              <ArrowUpRightIcon className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </CardHeader>
            <CardContent>
              {membershipUpdates.isPending ? (
                <>
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-5 w-48" />
                </>
              ) : membershipUpdates.isError ? (
                <p className="text-sm text-destructive">
                  Unable to load submission details.
                </p>
              ) : (
                <>
                  <p className="text-3xl font-semibold tabular-nums">
                    {membershipUpdates.data.total}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      {membershipUpdates.data.total === 1
                        ? "submission"
                        : "submissions"}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Last submission:{" "}
                    {membershipUpdates.data.items[0]
                      ? formatSubmissionDate(
                          membershipUpdates.data.items[0].submitted_at,
                        )
                      : "None yet"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>

        <ComingSoonCard title="Contact" />
        <ComingSoonCard title="Group Tickets" />
      </div>
    </div>
  )
}

function ComingSoonCard({ title }: { title: string }) {
  return (
    <Card
      className="relative min-h-40 select-none bg-muted/40 text-muted-foreground shadow-none"
      aria-disabled="true"
    >
      <CardHeader>
        <CardTitle className="uppercase">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">—</p>
        <p className="text-sm">Last submission: —</p>
      </CardContent>
      <div className="absolute inset-0 flex items-center justify-center bg-background/45">
        <span className="-rotate-6 border-y border-foreground/20 bg-background/90 px-8 py-2 font-heading text-sm font-semibold tracking-[0.2em] text-foreground uppercase shadow-xs">
          Coming Soon
        </span>
      </div>
    </Card>
  )
}
