import { zodResolver } from "@hookform/resolvers/zod"
import {
  useForm,
  type FieldValues,
  type Resolver,
  type UseFormProps,
} from "react-hook-form"
import type { z } from "zod"

/**
 * A schema whose *input* is form-shaped. The second type argument of Zod 4's
 * `ZodType<Output, Input>` is what react-hook-form holds in state.
 */
export type FormSchema = z.ZodType<unknown, FieldValues>

/**
 * `useForm` with the Zod resolver pre-wired and the input/output split kept
 * intact.
 *
 * The three generics matter. Form state is `z.input<S>` — what the DOM holds,
 * usually strings. `handleSubmit` receives `z.output<S>` — what the schema
 * produced, after `.transform()`, `.default()`, and friends. Collapsing them
 * (which `standardSchemaResolver` does) makes coercing schemas lie about the
 * payload type.
 *
 *   const form = useZodForm(goalsFormSchema, { defaultValues: { ... } })
 *   form.handleSubmit((values) => save(values))  // values: z.output<...>
 */
export function useZodForm<S extends FormSchema>(
  schema: S,
  props: Omit<
    UseFormProps<z.input<S>, unknown, z.output<S>>,
    "resolver"
  > = {},
) {
  return useForm<z.input<S>, unknown, z.output<S>>({
    // Validate on blur, then live once a field has been touched. Validating on
    // every keystroke from the start means shouting at someone halfway through
    // typing their first character.
    mode: "onTouched",
    ...props,
    // `zodResolver` resolves its overloads against a concrete schema; against
    // an unresolved generic it falls back to the loosest one. The assertion
    // restores what the overload would have produced at a real call site.
    resolver: zodResolver(schema) as unknown as Resolver<
      z.input<S>,
      unknown,
      z.output<S>
    >,
  })
}
