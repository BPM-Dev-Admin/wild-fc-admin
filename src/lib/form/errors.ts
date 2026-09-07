import type {
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form"
import type { z } from "zod"

/**
 * The one failure shape this template speaks.
 *
 * Every backend gets a small adapter that produces an `ActionFailure`; nothing
 * downstream — not `applyServerErrors`, not the form components — knows or
 * cares whether the request went to a Cloudflare Worker, D1, Supabase, or a
 * mock. Adding a backend means adding an adapter, not touching a form.
 */
export interface FieldIssue {
  /** Dot path into the form values, e.g. "name" or "items.0.amount". */
  path: string
  message: string
}

export interface ActionFailure {
  /** Errors with no field to attach to — conflicts, rate limits, outages. */
  formErrors: string[]
  fieldErrors: FieldIssue[]
}

const FAILURE_BRAND = "__actionFailure" as const

type BrandedFailure = ActionFailure & { readonly [FAILURE_BRAND]: true }

export function actionFailure(
  failure: Partial<ActionFailure>,
): ActionFailure {
  return {
    formErrors: failure.formErrors ?? [],
    fieldErrors: failure.fieldErrors ?? [],
    [FAILURE_BRAND]: true,
  } as BrandedFailure
}

export function isActionFailure(value: unknown): value is ActionFailure {
  return (
    typeof value === "object" &&
    value !== null &&
    FAILURE_BRAND in value &&
    (value as BrandedFailure)[FAILURE_BRAND] === true
  )
}

const GENERIC_MESSAGE = "Something went wrong. Please try again."

/* ------------------------------------------------------------------ *
 * Adapters
 * ------------------------------------------------------------------ */

/**
 * Zod issues → `ActionFailure`. Used on the client for defensive re-parses and
 * on the server by a Worker that imports the same schema out of
 * `src/lib/schemas/`. One schema, both sides, no drift.
 */
export function fromZodError(error: z.ZodError): ActionFailure {
  const fieldErrors: FieldIssue[] = []
  const formErrors: string[] = []

  for (const issue of error.issues) {
    if (issue.path.length === 0) {
      formErrors.push(issue.message)
      continue
    }
    fieldErrors.push({ path: issue.path.join("."), message: issue.message })
  }

  return actionFailure({ formErrors, fieldErrors })
}

/**
 * A JSON body from an API that already speaks `ActionFailure` (the shape a
 * Worker should return with a 422). Anything unrecognisable degrades to a
 * generic form-level error rather than throwing inside an error handler.
 */
export function fromResponseBody(body: unknown): ActionFailure {
  if (typeof body !== "object" || body === null) {
    return actionFailure({ formErrors: [GENERIC_MESSAGE] })
  }

  const candidate = body as Partial<ActionFailure> & { message?: unknown }

  const fieldErrors = Array.isArray(candidate.fieldErrors)
    ? candidate.fieldErrors.filter(
        (issue): issue is FieldIssue =>
          typeof issue?.path === "string" && typeof issue?.message === "string",
      )
    : []

  const formErrors = Array.isArray(candidate.formErrors)
    ? candidate.formErrors.filter(
        (message): message is string => typeof message === "string",
      )
    : typeof candidate.message === "string"
      ? [candidate.message]
      : []

  if (formErrors.length === 0 && fieldErrors.length === 0) {
    return actionFailure({ formErrors: [GENERIC_MESSAGE] })
  }

  return actionFailure({ formErrors, fieldErrors })
}

/** The subset of Supabase's `PostgrestError` we need, duck-typed so this file
 *  does not pull in `@supabase/supabase-js`. */
interface PostgrestErrorLike {
  code: string
  message: string
  details?: string | null
  hint?: string | null
}

function isPostgrestError(value: unknown): value is PostgrestErrorLike {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as PostgrestErrorLike).code === "string" &&
    typeof (value as PostgrestErrorLike).message === "string"
  )
}

export interface PostgrestAdapterOptions {
  /**
   * Maps a constraint name to the form field that violated it, so a unique
   * index becomes an inline error instead of a banner:
   *
   *   { goals_name_key: "name" }
   *
   * Postgres does not tell you which column a constraint covers, so this map
   * belongs to the consuming app — the template cannot guess it.
   */
  constraints?: Record<string, string>
  /** Message used for a mapped unique violation. */
  duplicateMessage?: (field: string) => string
}

/** Supabase `PostgrestError` → `ActionFailure`. */
export function fromPostgrestError(
  error: PostgrestErrorLike,
  options: PostgrestAdapterOptions = {},
): ActionFailure {
  const {
    constraints = {},
    duplicateMessage = () => "That value is already taken.",
  } = options

  // 23505 unique_violation — the only class of DB error that reliably maps to
  // a single field, and only when the app has named the constraint for us.
  if (error.code === "23505") {
    const haystack = `${error.message} ${error.details ?? ""}`
    const matched = Object.keys(constraints).find((constraint) =>
      haystack.includes(constraint),
    )
    if (matched) {
      const field = constraints[matched]
      return actionFailure({
        fieldErrors: [{ path: field, message: duplicateMessage(field) }],
      })
    }
    return actionFailure({ formErrors: ["That record already exists."] })
  }

  if (error.code === "23503") {
    return actionFailure({
      formErrors: ["A referenced record no longer exists. Refresh and retry."],
    })
  }

  if (error.code === "23514") {
    return actionFailure({ formErrors: ["That change is not allowed."] })
  }

  // RLS denial. Surfacing the raw Postgres text here leaks schema detail.
  if (error.code === "42501") {
    return actionFailure({
      formErrors: ["You do not have permission to make this change."],
    })
  }

  return actionFailure({ formErrors: [GENERIC_MESSAGE] })
}

/**
 * Last-resort normaliser for a `catch` block or a react-query `onError`, where
 * the value is `unknown` and could be anything.
 */
export function toActionFailure(
  error: unknown,
  options: PostgrestAdapterOptions = {},
): ActionFailure {
  if (isActionFailure(error)) return error
  if (isPostgrestError(error)) return fromPostgrestError(error, options)
  if (error instanceof Error) {
    return actionFailure({ formErrors: [error.message] })
  }
  return actionFailure({ formErrors: [GENERIC_MESSAGE] })
}

/* ------------------------------------------------------------------ *
 * Applying a failure to a form
 * ------------------------------------------------------------------ */

/**
 * Writes an `ActionFailure` onto a form. Field errors land inline via
 * `<FormField>`; form-level errors land on `root.server`, which
 * `<FormRootError>` renders.
 *
 * Errors set here are cleared by the next successful validation pass, so a
 * server-rejected field stops complaining as soon as the user edits it.
 */
export function applyServerErrors<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
>(
  form: UseFormReturn<TFieldValues, TContext, TTransformedValues>,
  failure: ActionFailure,
  options: { focus?: boolean } = {},
): void {
  const { focus = true } = options
  let focused = false

  for (const issue of failure.fieldErrors) {
    const path = issue.path as FieldPath<TFieldValues>
    form.setError(
      path,
      { type: "server", message: issue.message },
      // Focus the first rejected field only.
      { shouldFocus: focus && !focused },
    )
    focused = true
  }

  if (failure.formErrors.length > 0) {
    form.setError("root.server", {
      type: "server",
      message: failure.formErrors.join(" "),
    })
  }
}
