import { createFileRoute } from "@tanstack/react-router"

import { PagePlaceholder } from "@/components/page-placeholder"
import { pageHead } from "@/lib/head"

export const Route = createFileRoute("/settings/limits")({
  head: () => pageHead("Limits"),
  component: () => <PagePlaceholder title="Limits" />,
})
