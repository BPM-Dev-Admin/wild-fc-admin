export type MembershipUpdateListItem = {
  id: string
  submitted_at: string
  full_name: string
  email: string
  stm_number: string | null
  help_topics: string
  notification_status: string
}

export type MembershipUpdate = MembershipUpdateListItem & {
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

export type MembershipUpdatePage = {
  items: MembershipUpdateListItem[]
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

export function fetchMembershipUpdates(page: number, search: string) {
  const params = new URLSearchParams({ page: String(page) })
  if (search) params.set("q", search)

  return getJson<MembershipUpdatePage>(
    `/api/forms/membership-updates/submissions?${params.toString()}`,
  )
}

export async function fetchMembershipUpdate(id: string) {
  const response = await getJson<{ submission: MembershipUpdate }>(
    `/api/forms/membership-updates/submissions/${encodeURIComponent(id)}`,
  )
  return response.submission
}
