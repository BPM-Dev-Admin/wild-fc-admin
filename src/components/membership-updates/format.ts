const HELP_TOPIC_LABELS: Record<string, string> = {
  update_contact_or_payment: "Update contact or payment information",
  change_seat_count: "Change the number of seats",
  change_seat_location: "Change seat location",
  update_parking: "Update parking pass",
  change_account_holder: "Change the account holder",
  update_payment_plan: "Update payment plan",
  update_credit_card: "Update credit card information",
  consider_cancelling: "Considering cancelling",
  cancel_membership: "Cancel season ticket membership",
  other: "Other",
}

const CANCELLATION_REASON_LABELS: Record<string, string> = {
  moving_away: "Moving away",
  ticket_price: "Ticket price",
  unused_tickets: "Unused tickets",
  match_schedule: "Match schedule",
  seat_location: "Seat location",
  team_performance: "Team performance",
  match_experience: "Match experience",
  personal_or_financial: "Personal or financial reasons",
  other: "Other",
  prefer_not_to_say: "Prefer not to say",
}

const CANCELLATION_OPTION_LABELS: Record<string, string> = {
  fewer_seats: "Fewer seats",
  different_seat_location: "Different seat location",
  different_payment_plan: "Different payment plan",
  flexible_ticket_options: "Flexible ticket options",
  unused_ticket_options: "Options for unused tickets",
  other: "Other",
}

export function parseList(value: string) {
  try {
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : []
  } catch {
    return []
  }
}

function fallbackLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function formatChoice(value: string | null) {
  return value ? fallbackLabel(value) : "Not provided"
}

export function formatHelpTopics(value: string) {
  return parseList(value).map((topic) => HELP_TOPIC_LABELS[topic] ?? fallbackLabel(topic))
}

export function formatCancellationReasons(value: string) {
  return parseList(value).map(
    (reason) => CANCELLATION_REASON_LABELS[reason] ?? fallbackLabel(reason),
  )
}

export function formatCancellationOptions(value: string) {
  return parseList(value).map(
    (option) => CANCELLATION_OPTION_LABELS[option] ?? fallbackLabel(option),
  )
}
