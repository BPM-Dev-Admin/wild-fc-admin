import type { ReactNode } from "react"
import { Link, type ErrorComponentProps } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

function CenteredState({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      {children}
    </div>
  )
}

/** Rendered when a route's loader or component throws. */
export function RouteError({ error, reset }: ErrorComponentProps) {
  return (
    <CenteredState>
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold">
          Something went wrong
        </h1>
        <p className="text-muted-foreground text-sm">{error.message}</p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </CenteredState>
  )
}

/** Rendered for unmatched URLs and for `notFound()` thrown from a loader. */
export function RouteNotFound() {
  return (
    <CenteredState>
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground text-sm">
          That page doesn&apos;t exist or may have moved.
        </p>
      </div>
      <Button nativeButton={false} render={<Link to="/" />}>
        Go home
      </Button>
    </CenteredState>
  )
}

/** Rendered while a route's loader is pending past the default delay. */
export function RoutePending() {
  return (
    <CenteredState>
      <Spinner className="text-muted-foreground size-6" />
    </CenteredState>
  )
}
