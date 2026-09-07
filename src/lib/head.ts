export const APP_NAME = "Wild FC Admin"

/**
 * Builds a route's `head` payload. Titles fall back to the app name.
 *
 *   export const Route = createFileRoute("/dashboard")({
 *     head: () => pageHead("Dashboard"),
 *     component: DashboardPage,
 *   })
 */
export function pageHead(title?: string) {
  return {
    meta: [{ title: title ? `${title} · ${APP_NAME}` : APP_NAME }],
  }
}
