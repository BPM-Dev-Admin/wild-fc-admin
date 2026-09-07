export type ContactSubmissionListItem = {
  id: string
  submitted_at: string
  first_name: string
  last_name: string
  email: string
  topic: string
  email_status: string
  sync_status: string | null
}

export type ContactSubmission = ContactSubmissionListItem & {
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

export type ContactSubmissionPage = {
  items: ContactSubmissionListItem[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(body?.error ?? `Request failed with status ${response.status}.`)
  }

  return response.json() as Promise<T>
}

export function fetchContactSubmissions(page: number, search: string) {
  const params = new URLSearchParams({ page: String(page) })
  if (search) {
    params.set("q", search)
  }

  return getJson<ContactSubmissionPage>(
    `/api/forms/contact/submissions?${params.toString()}`
  )
}

export async function fetchContactSubmission(id: string) {
  const response = await getJson<{ submission: ContactSubmission }>(
    `/api/forms/contact/submissions/${encodeURIComponent(id)}`
  )
  return response.submission
}
