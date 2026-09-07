import { createFileRoute } from "@tanstack/react-router"

import { PagePlaceholder } from "@/components/page-placeholder"
import { pageHead } from "@/lib/head"

export const Route = createFileRoute("/dashboard")({
  head: () => pageHead("Dashboard"),
  component: () => <PagePlaceholder title="Dashboard" />,
})
