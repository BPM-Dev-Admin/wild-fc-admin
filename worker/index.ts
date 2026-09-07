const PAGE_SIZE = 10
const MAX_SEARCH_LENGTH = 100
const MEMBERSHIP_FORM_ID = "season-ticket-membership-update"

type MembershipUpdateListRow = {
  id: string
  submitted_at: string
  full_name: string
  email: string
  stm_number: string | null
  help_topics: string
  notification_status: string
}

type MembershipUpdateDetailRow = MembershipUpdateListRow & {
  phone: string
  updated_email: string | null
  updated_phone: string | null
  updated_mailing_address: string | null
  current_seat_count: number | null
  requested_seat_count: number | null
  seat_location_first_choice: string | null
  seat_location_second_choice: string | null
  seat_location_third_choice: string | null
  parking_action: string | null
  new_account_holder_name: string | null
  new_account_holder_phone: string | null
  new_account_holder_email: string | null
  new_account_holder_mailing_address: string | null
  tickets_to_transfer: number | null
  payment_plan_action: string | null
  credit_card_action: string | null
  cancellation_reasons: string
  cancellation_options: string
  considering_cancellation_contact_method: string | null
  cancellation_contact_method: string | null
  cancellation_request_acknowledged: number
  cancellation_written_confirmation_acknowledged: number
  notes: string | null
  notification_error: string | null
  protection_status: string
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  })
}

function parsePage(value: string | null) {
  const page = Number(value ?? "1")
  return Number.isSafeInteger(page) && page > 0 ? page : 1
}

function escapeLike(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_")
}

async function listMembershipUpdates(
  request: Request,
  env: CloudflareBindings,
) {
  const url = new URL(request.url)
  const page = parsePage(url.searchParams.get("page"))
  const search = (url.searchParams.get("q") ?? "").trim().slice(0, MAX_SEARCH_LENGTH)
  const offset = (page - 1) * PAGE_SIZE
  const whereClause = search
    ? `AND (
        LOWER(stm.full_name) LIKE ? ESCAPE '\\'
        OR LOWER(stm.email) LIKE ? ESCAPE '\\'
        OR LOWER(COALESCE(stm.stm_number, '')) LIKE ? ESCAPE '\\'
        OR LOWER(REPLACE(stm.help_topics, '_', ' ')) LIKE ? ESCAPE '\\'
      )`
    : ""
  const searchPattern = `%${escapeLike(search.toLowerCase())}%`
  const searchBindings = search
    ? [searchPattern, searchPattern, searchPattern, searchPattern]
    : []

  const count = await env.DB.prepare(
    `SELECT COUNT(*) AS total
    FROM form_submissions fs
    INNER JOIN season_ticket_membership_update stm ON stm.submission_id = fs.id
    WHERE fs.form_id = ?
    ${whereClause}`,
  )
    .bind(MEMBERSHIP_FORM_ID, ...searchBindings)
    .first<{ total: number }>()

  const rows = await env.DB.prepare(
    `SELECT
      fs.id,
      fs.submitted_at,
      stm.full_name,
      stm.email,
      stm.stm_number,
      stm.help_topics,
      fs.staff_notification_status AS notification_status
    FROM form_submissions fs
    INNER JOIN season_ticket_membership_update stm ON stm.submission_id = fs.id
    WHERE fs.form_id = ?
    ${whereClause}
    ORDER BY fs.submitted_at DESC, fs.id DESC
    LIMIT ? OFFSET ?`,
  )
    .bind(MEMBERSHIP_FORM_ID, ...searchBindings, PAGE_SIZE, offset)
    .all<MembershipUpdateListRow>()

  const total = count?.total ?? 0

  return json({
    items: rows.results,
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  })
}

async function getMembershipUpdate(id: string, env: CloudflareBindings) {
  const submission = await env.DB.prepare(
    `SELECT
      fs.id,
      fs.submitted_at,
      stm.full_name,
      stm.email,
      stm.phone,
      stm.stm_number,
      stm.help_topics,
      stm.updated_email,
      stm.updated_phone,
      stm.updated_mailing_address,
      stm.current_seat_count,
      stm.requested_seat_count,
      stm.seat_location_first_choice,
      stm.seat_location_second_choice,
      stm.seat_location_third_choice,
      stm.parking_action,
      stm.new_account_holder_name,
      stm.new_account_holder_phone,
      stm.new_account_holder_email,
      stm.new_account_holder_mailing_address,
      stm.tickets_to_transfer,
      stm.payment_plan_action,
      stm.credit_card_action,
      stm.cancellation_reasons,
      stm.cancellation_options,
      stm.considering_cancellation_contact_method,
      stm.cancellation_contact_method,
      stm.cancellation_request_acknowledged,
      stm.cancellation_written_confirmation_acknowledged,
      stm.notes,
      fs.staff_notification_status AS notification_status,
      fs.staff_notification_error AS notification_error,
      fs.protection_status
    FROM form_submissions fs
    INNER JOIN season_ticket_membership_update stm ON stm.submission_id = fs.id
    WHERE fs.id = ? AND fs.form_id = ?
    LIMIT 1`,
  )
    .bind(id, MEMBERSHIP_FORM_ID)
    .first<MembershipUpdateDetailRow>()

  return submission
    ? json({ submission })
    : json({ error: "Membership update submission not found." }, 404)
}

async function handleApiRequest(request: Request, env: CloudflareBindings) {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed." }), {
      status: 405,
      headers: {
        Allow: "GET",
        "Cache-Control": "private, no-store",
        "Content-Type": "application/json; charset=utf-8",
      },
    })
  }

  const { pathname } = new URL(request.url)
  if (pathname === "/api/forms/membership-updates/submissions") {
    return listMembershipUpdates(request, env)
  }

  const detailMatch = pathname.match(
    /^\/api\/forms\/membership-updates\/submissions\/([^/]+)$/,
  )
  if (detailMatch?.[1]) {
    return getMembershipUpdate(decodeURIComponent(detailMatch[1]), env)
  }

  return json({ error: "API route not found." }, 404)
}

export default {
  async fetch(request: Request, env: CloudflareBindings): Promise<Response> {
    try {
      return await handleApiRequest(request, env)
    } catch (error) {
      console.error("Wild FC Admin API request failed", error)
      return json({ error: "Unable to load membership updates." }, 500)
    }
  },
}
