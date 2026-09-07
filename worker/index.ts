const PAGE_SIZE = 10
const MAX_SEARCH_LENGTH = 100

type ContactListRow = {
  id: string
  submitted_at: string
  first_name: string
  last_name: string
  email: string
  topic: string
  email_status: string
  sync_status: string | null
}

type ContactDetailRow = ContactListRow & {
  message: string
  newsletter_opt_in: number
  email_provider: string
  email_message_id: string | null
  email_error: string | null
  sync_provider: string | null
  sync_external_id: string | null
  sync_error: string | null
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

async function listContactSubmissions(request: Request, env: CloudflareBindings) {
  const url = new URL(request.url)
  const page = parsePage(url.searchParams.get("page"))
  const search = (url.searchParams.get("q") ?? "").trim().slice(0, MAX_SEARCH_LENGTH)
  const offset = (page - 1) * PAGE_SIZE

  const whereClause = search
    ? `WHERE LOWER(first_name || ' ' || last_name) LIKE ? ESCAPE '\\'
        OR LOWER(email) LIKE ? ESCAPE '\\'
        OR LOWER(topic) LIKE ? ESCAPE '\\'`
    : ""
  const searchPattern = `%${escapeLike(search.toLowerCase())}%`
  const searchBindings = search ? [searchPattern, searchPattern, searchPattern] : []

  const count = await env.DB.prepare(
    `SELECT COUNT(*) AS total FROM contact ${whereClause}`
  )
    .bind(...searchBindings)
    .first<{ total: number }>()

  const rows = await env.DB.prepare(
    `SELECT
      id,
      submitted_at,
      first_name,
      last_name,
      email,
      topic,
      email_status,
      sync_status
    FROM contact
    ${whereClause}
    ORDER BY submitted_at DESC, id DESC
    LIMIT ? OFFSET ?`
  )
    .bind(...searchBindings, PAGE_SIZE, offset)
    .all<ContactListRow>()

  const total = count?.total ?? 0

  return json({
    items: rows.results,
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  })
}

async function getContactSubmission(id: string, env: CloudflareBindings) {
  const submission = await env.DB.prepare(
    `SELECT
      id,
      submitted_at,
      first_name,
      last_name,
      email,
      topic,
      message,
      newsletter_opt_in,
      email_status,
      email_provider,
      email_message_id,
      email_error,
      sync_status,
      sync_provider,
      sync_external_id,
      sync_error,
      protection_status
    FROM contact
    WHERE id = ?
    LIMIT 1`
  )
    .bind(id)
    .first<ContactDetailRow>()

  return submission
    ? json({ submission })
    : json({ error: "Contact submission not found." }, 404)
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

  if (pathname === "/api/forms/contact/submissions") {
    return listContactSubmissions(request, env)
  }

  const detailMatch = pathname.match(
    /^\/api\/forms\/contact\/submissions\/([^/]+)$/
  )
  if (detailMatch?.[1]) {
    return getContactSubmission(decodeURIComponent(detailMatch[1]), env)
  }

  return json({ error: "API route not found." }, 404)
}

export default {
  async fetch(request: Request, env: CloudflareBindings): Promise<Response> {
    try {
      return await handleApiRequest(request, env)
    } catch (error) {
      console.error("Wild FC Admin API request failed", error)
      return json({ error: "Unable to load submissions." }, 500)
    }
  },
}
