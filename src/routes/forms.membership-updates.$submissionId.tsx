import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowLeftIcon, MailIcon } from "lucide-react"

import {
  formatCancellationOptions,
  formatCancellationReasons,
  formatChoice,
  formatHelpTopics,
} from "@/components/membership-updates/format"
import { StatusBadge } from "@/components/status-badge"
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
import { fetchMembershipUpdate } from "@/lib/api/membership-updates"
import { formatSubmissionDate } from "@/lib/format"
import { pageHead } from "@/lib/head"

export const Route = createFileRoute("/forms/membership-updates/$submissionId")({
  head: () => pageHead("Membership update"),
  component: MembershipUpdatePage,
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

function Value({ value }: { value: string | number | null }) {
  return <>{value === null || value === "" ? "Not provided" : value}</>
}

function ListValue({ values }: { values: string[] }) {
  return values.length ? (
    <ul className="list-disc space-y-1 pl-5">
      {values.map((value) => <li key={value}>{value}</li>)}
    </ul>
  ) : (
    <>Not provided</>
  )
}

function MembershipUpdatePage() {
  const { submissionId } = Route.useParams()
  const submission = useQuery({
    queryKey: ["membership-update", submissionId],
    queryFn: () => fetchMembershipUpdate(submissionId),
  })

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <Button
          nativeButton={false}
          variant="ghost"
          size="sm"
          render={
            <Link
              to="/forms/membership-updates"
              search={{ page: 1, q: "" }}
            />
          }
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Membership updates
        </Button>
      </div>

      {submission.isPending ? (
        <div className="space-y-3" aria-label="Loading membership update">
          <Skeleton className="h-20 w-full rounded-none" />
          <Skeleton className="h-96 w-full rounded-none" />
        </div>
      ) : submission.isError ? (
        <div className="border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {submission.error.message}
        </div>
      ) : (
        <MembershipUpdateDetails submission={submission.data} />
      )}
    </div>
  )
}

function MembershipUpdateDetails({
  submission,
}: {
  submission: Awaited<ReturnType<typeof fetchMembershipUpdate>>
}) {
  const helpTopics = formatHelpTopics(submission.help_topics)
  const selectedTopics = new Set(
    (() => {
      try {
        const parsed: unknown = JSON.parse(submission.help_topics)
        return Array.isArray(parsed)
          ? parsed.filter((value): value is string => typeof value === "string")
          : []
      } catch {
        return []
      }
    })(),
  )
  const hasTopic = (topic: string) => selectedTopics.has(topic)
  const showsCancellation =
    hasTopic("consider_cancelling") || hasTopic("cancel_membership")

  return (
    <>
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold uppercase">
          {submission.full_name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Submitted {formatSubmissionDate(submission.submitted_at)}
        </p>
      </div>

      <Card className="rounded-none">
        <CardHeader className="rounded-none border-b">
          <CardTitle className="uppercase">Member details</CardTitle>
          <CardDescription>
            The contact and account information supplied with this request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-5 sm:grid-cols-2">
            <DetailItem label="Name">{submission.full_name}</DetailItem>
            <DetailItem label="STM number">
              <Value value={submission.stm_number} />
            </DetailItem>
            <DetailItem label="Email">
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${submission.email}`}
                  className="min-w-0 truncate underline underline-offset-4 hover:text-primary"
                >
                  {submission.email}
                </a>
                <CopyToClipboard value={submission.email} />
              </div>
            </DetailItem>
            <DetailItem label="Phone">{submission.phone}</DetailItem>
          </dl>
        </CardContent>
      </Card>

      <Card className="rounded-none">
        <CardHeader className="rounded-none border-b">
          <CardTitle className="uppercase">Requested help</CardTitle>
          <CardDescription>
            The membership changes or support selected by the member.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-5 sm:grid-cols-2">
            <DetailItem label="Help topics" fullWidth>
              <ListValue values={helpTopics} />
            </DetailItem>
            <DetailItem label="Additional notes" fullWidth>
              <p className="whitespace-pre-wrap leading-relaxed">
                <Value value={submission.notes} />
              </p>
            </DetailItem>
          </dl>
        </CardContent>
      </Card>

      {hasTopic("update_contact_or_payment") ? (
        <Card className="rounded-none">
          <CardHeader className="rounded-none border-b">
            <CardTitle className="uppercase">Contact updates</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2">
              <DetailItem label="Updated email"><Value value={submission.updated_email} /></DetailItem>
              <DetailItem label="Updated phone"><Value value={submission.updated_phone} /></DetailItem>
              <DetailItem label="Updated mailing address" fullWidth>
                <Value value={submission.updated_mailing_address} />
              </DetailItem>
            </dl>
          </CardContent>
        </Card>
      ) : null}

      {hasTopic("change_seat_count") || hasTopic("change_seat_location") ? (
        <Card className="rounded-none">
          <CardHeader className="rounded-none border-b">
            <CardTitle className="uppercase">Seat updates</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2">
              {hasTopic("change_seat_count") ? (
                <>
                  <DetailItem label="Current seat count"><Value value={submission.current_seat_count} /></DetailItem>
                  <DetailItem label="Requested seat count"><Value value={submission.requested_seat_count} /></DetailItem>
                </>
              ) : null}
              {hasTopic("change_seat_location") ? (
                <>
                  <DetailItem label="First location choice"><Value value={submission.seat_location_first_choice} /></DetailItem>
                  <DetailItem label="Second location choice"><Value value={submission.seat_location_second_choice} /></DetailItem>
                  <DetailItem label="Third location choice"><Value value={submission.seat_location_third_choice} /></DetailItem>
                </>
              ) : null}
            </dl>
          </CardContent>
        </Card>
      ) : null}

      {hasTopic("update_parking") || hasTopic("change_account_holder") ? (
        <Card className="rounded-none">
          <CardHeader className="rounded-none border-b">
            <CardTitle className="uppercase">Account updates</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2">
              {hasTopic("update_parking") ? (
                <DetailItem label="Parking action">{formatChoice(submission.parking_action)}</DetailItem>
              ) : null}
              {hasTopic("change_account_holder") ? (
                <>
                  <DetailItem label="New account holder"><Value value={submission.new_account_holder_name} /></DetailItem>
                  <DetailItem label="Tickets to transfer"><Value value={submission.tickets_to_transfer} /></DetailItem>
                  <DetailItem label="New holder email"><Value value={submission.new_account_holder_email} /></DetailItem>
                  <DetailItem label="New holder phone"><Value value={submission.new_account_holder_phone} /></DetailItem>
                  <DetailItem label="New holder mailing address" fullWidth>
                    <Value value={submission.new_account_holder_mailing_address} />
                  </DetailItem>
                </>
              ) : null}
            </dl>
          </CardContent>
        </Card>
      ) : null}

      {hasTopic("update_payment_plan") || hasTopic("update_credit_card") ? (
        <Card className="rounded-none">
          <CardHeader className="rounded-none border-b">
            <CardTitle className="uppercase">Payment updates</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2">
              {hasTopic("update_payment_plan") ? (
                <DetailItem label="Payment plan action">{formatChoice(submission.payment_plan_action)}</DetailItem>
              ) : null}
              {hasTopic("update_credit_card") ? (
                <DetailItem label="Credit card action">{formatChoice(submission.credit_card_action)}</DetailItem>
              ) : null}
            </dl>
          </CardContent>
        </Card>
      ) : null}

      {showsCancellation ? (
        <Card className="rounded-none">
          <CardHeader className="rounded-none border-b">
            <CardTitle className="uppercase">Cancellation details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2">
              <DetailItem label="Reasons" fullWidth>
                <ListValue values={formatCancellationReasons(submission.cancellation_reasons)} />
              </DetailItem>
              {hasTopic("consider_cancelling") ? (
                <>
                  <DetailItem label="Options to discuss" fullWidth>
                    <ListValue values={formatCancellationOptions(submission.cancellation_options)} />
                  </DetailItem>
                  <DetailItem label="Discussion contact method">
                    {formatChoice(submission.considering_cancellation_contact_method)}
                  </DetailItem>
                </>
              ) : null}
              {hasTopic("cancel_membership") ? (
                <>
                  <DetailItem label="Cancellation contact method">
                    {formatChoice(submission.cancellation_contact_method)}
                  </DetailItem>
                  <DetailItem label="Cancellation request acknowledged">
                    {submission.cancellation_request_acknowledged ? "Yes" : "No"}
                  </DetailItem>
                  <DetailItem label="Written confirmation acknowledged">
                    {submission.cancellation_written_confirmation_acknowledged ? "Yes" : "No"}
                  </DetailItem>
                </>
              ) : null}
            </dl>
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-none">
        <CardHeader className="rounded-none border-b">
          <CardTitle className="uppercase">Submission status</CardTitle>
          <CardDescription>
            Staff notification and spam-protection outcomes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-5 sm:grid-cols-2">
            <DetailItem label="Staff notification">
              <StatusBadge value={submission.notification_status} />
            </DetailItem>
            <DetailItem label="Notification error">
              <Value value={submission.notification_error} />
            </DetailItem>
            <DetailItem label="Protection status">
              <StatusBadge value={submission.protection_status} />
            </DetailItem>
            <DetailItem label="Submission ID">
              <div className="flex items-center gap-2">
                <code className="min-w-0 truncate text-xs">{submission.id}</code>
                <CopyToClipboard value={submission.id} />
              </div>
            </DetailItem>
          </dl>
        </CardContent>
      </Card>

      <a
        href={`mailto:${submission.email}`}
        className="inline-flex w-fit items-center gap-2 text-sm font-medium underline underline-offset-4"
      >
        <MailIcon className="size-4" />
        Email {submission.full_name}
      </a>
    </>
  )
}
