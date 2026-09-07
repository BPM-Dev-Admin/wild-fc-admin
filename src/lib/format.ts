const dateWithMinutes = new Intl.DateTimeFormat("en-CA", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Edmonton",
  timeZoneName: "short",
})

const dateOnHour = new Intl.DateTimeFormat("en-CA", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  timeZone: "America/Edmonton",
  timeZoneName: "short",
})

export function formatSubmissionDate(value: string) {
  const date = new Date(value)
  return (date.getUTCMinutes() === 0 ? dateOnHour : dateWithMinutes).format(date)
}

export function formatStatus(value: string) {
  return value.replaceAll("_", " ")
}
