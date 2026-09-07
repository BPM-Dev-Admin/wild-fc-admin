import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowLeftIcon, MailIcon } from "lucide-react"

import { StatusBadge } from "@/components/contact/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CopyToClipboard } from "@/components/ui/copy-to-clipboard"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchContactSubmission } from "@/lib/api/contact"
import { formatSubmissionDate } from "@/lib/format"
import { pageHead } from "@/lib/head"

export const Route = createFileRoute("/forms/contact/$submissionId")({
  head: () => pageHead("Contact submission"),
  component: ContactSubmissionPage,
})

function DetailItem({
  label,
  children,
  fullWidth = false,
}: {
  label: string
  children: React.ReactNode
  fullWidth?: boolean
}) {
  return (
    <div className={fullWidth ? "space-y-1 sm:col-span-2" : "space-y-1"}>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0 text-sm">{children}</dd>
    </div>
  )
}

function ContactSubmissionPage() {
  const { submissionId } = Route.useParams()
  const submission = useQuery({
    queryKey: ["contact-submission", submissionId],
    queryFn: () => fetchContactSubmission(submissionId),
  })

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <Button
          nativeButton={false}
          variant="ghost"
          size="sm"
          render={<Link to="/forms/contact" search={{ page: 1, q: "" }} />}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Contact submissions
        </Button>
      </div>

      {submission.isPending ? (
        <div className="space-y-3" aria-label="Loading submission">
          <Skeleton className="h-20 w-full rounded-none" />
          <Skeleton className="h-96 w-full rounded-none" />
        </div>
      ) : submission.isError ? (
        <div className="border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {submission.error.message}
        </div>
      ) : (
        <>
          <div className="space-y-1">
            <h1 className="font-heading text-2xl font-semibold uppercase">
              {submission.data.first_name} {submission.data.last_name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Submitted {formatSubmissionDate(submission.data.submitted_at)}
            </p>
          </div>

          <Card className="rounded-none">
            <CardHeader className="rounded-none border-b">
              <CardTitle className="uppercase">Contact details</CardTitle>
              <CardDescription>
                The contact information supplied with this message.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-5 sm:grid-cols-2">
                <DetailItem label="Name">
                  {submission.data.first_name} {submission.data.last_name}
                </DetailItem>
                <DetailItem label="Email">
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${submission.data.email}`}
                      className="min-w-0 truncate underline underline-offset-4 hover:text-primary"
                    >
                      {submission.data.email}
                    </a>
                    <CopyToClipboard value={submission.data.email} />
                  </div>
                </DetailItem>
                <DetailItem label="Topic" fullWidth>
                  {submission.data.topic}
                </DetailItem>
                <DetailItem label="Message" fullWidth>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {submission.data.message}
                  </p>
                </DetailItem>
              </dl>
            </CardContent>
          </Card>

          <Card className="rounded-none">
            <CardHeader className="rounded-none border-b">
              <CardTitle className="uppercase">Delivery details</CardTitle>
              <CardDescription>
                Notification, newsletter, and spam-protection outcomes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-5 sm:grid-cols-2">
                <DetailItem label="Staff notification">
                  <StatusBadge value={submission.data.email_status} />
                </DetailItem>
                <DetailItem label="Email provider">
                  {submission.data.email_provider}
                </DetailItem>
                <DetailItem label="Email message ID">
                  {submission.data.email_message_id ?? "Not available"}
                </DetailItem>
                <DetailItem label="Notification error">
                  {submission.data.email_error ?? "None"}
                </DetailItem>
                <DetailItem label="Newsletter opt-in">
                  {submission.data.newsletter_opt_in ? "Yes" : "No"}
                </DetailItem>
                <DetailItem label="Newsletter sync">
                  <StatusBadge value={submission.data.sync_status} />
                </DetailItem>
                <DetailItem label="Sync provider">
                  {submission.data.sync_provider ?? "Not applicable"}
                </DetailItem>
                <DetailItem label="Sync error">
                  {submission.data.sync_error ?? "None"}
                </DetailItem>
                <DetailItem label="Protection status">
                  <StatusBadge value={submission.data.protection_status} />
                </DetailItem>
                <DetailItem label="Submission ID">
                  <div className="flex items-center gap-2">
                    <code className="min-w-0 truncate text-xs">
                      {submission.data.id}
                    </code>
                    <CopyToClipboard value={submission.data.id} />
                  </div>
                </DetailItem>
              </dl>
            </CardContent>
          </Card>

          <a
            href={`mailto:${submission.data.email}`}
            className="inline-flex w-fit items-center gap-2 text-sm font-medium underline underline-offset-4"
          >
            <MailIcon className="size-4" />
            Email {submission.data.first_name}
          </a>
        </>
      )}
    </div>
  )
}
