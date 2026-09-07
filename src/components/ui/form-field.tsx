import * as React from "react"
import {
  Controller,
  type Control,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"

type FieldOrientation = React.ComponentProps<typeof Field>["orientation"]

/**
 * What a `<FormField>` hands its render child.
 *
 * Base UI has no `asChild`/`Slot`, so there is no equivalent of the Radix-era
 * `<FormControl>` that injected these props into an arbitrary element. The
 * render child receives them explicitly instead — pass them through one of the
 * adapters below rather than spreading by hand, because Base UI's change
 * handlers do not match react-hook-form's.
 */
export interface FormControl<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  field: ControllerRenderProps<TFieldValues, TName>
  fieldState: ControllerFieldState
  /** Put on the focusable control so `<FieldLabel htmlFor>` resolves. */
  id: string
  "aria-invalid": true | undefined
  "aria-describedby": string | undefined
}

export interface FormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TContext,
  TTransformedValues,
> {
  // All three generics have to travel together. `Control<TFieldValues>` alone
  // defaults the transformed type back to the input type, which stops
  // type-checking the moment a schema transforms anything.
  control: Control<TFieldValues, TContext, TTransformedValues>
  name: TName
  label?: React.ReactNode
  description?: React.ReactNode
  /**
   * `horizontal` puts the control first with the text stacked beside it — the
   * layout checkboxes and switches want. Everything else labels top-down.
   */
  orientation?: FieldOrientation
  className?: string
  children: (control: FormControl<TFieldValues, TName>) => React.ReactNode
}

/**
 * One labelled, described, error-reporting field.
 *
 * Wires the ids so the label, description and error are all associated with
 * the control, and sets `data-invalid` on the wrapper — which `field.tsx`
 * already styles, and which the `aria-invalid` variants on `Input`,
 * `Textarea`, `SelectTrigger`, `Checkbox` and `Switch` already respond to.
 *
 *   <FormField control={form.control} name="name" label="Goal name">
 *     {(c) => <Input {...inputProps(c)} />}
 *   </FormField>
 */
export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TContext = unknown,
  TTransformedValues = TFieldValues,
>({
  control,
  name,
  label,
  description,
  orientation = "vertical",
  className,
  children,
}: FormFieldProps<TFieldValues, TName, TContext, TTransformedValues>) {
  const uid = React.useId()
  const id = `${uid}${name}`
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const describedBy =
          [
            description ? descriptionId : null,
            fieldState.error ? errorId : null,
          ]
            .filter(Boolean)
            .join(" ") || undefined

        const rendered = children({
          field,
          fieldState,
          id,
          "aria-invalid": fieldState.invalid || undefined,
          "aria-describedby": describedBy,
        })

        const labelNode = label ? (
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
        ) : null
        const descriptionNode = description ? (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        ) : null
        const errorNode = (
          <FieldError id={errorId} errors={[fieldState.error]} />
        )

        if (orientation === "horizontal") {
          return (
            <Field
              orientation="horizontal"
              data-invalid={fieldState.invalid || undefined}
              className={className}
            >
              {rendered}
              <FieldContent>
                {labelNode}
                {descriptionNode}
                {errorNode}
              </FieldContent>
            </Field>
          )
        }

        return (
          <Field
            orientation={orientation}
            data-invalid={fieldState.invalid || undefined}
            className={className}
          >
            {labelNode}
            {rendered}
            {descriptionNode}
            {errorNode}
          </Field>
        )
      }}
    />
  )
}

/**
 * Renders the form-level error written by `applyServerErrors` — the "this
 * failed but not because of any one field" case.
 */
export function FormRootError<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
>({
  form,
  className,
}: {
  form: UseFormReturn<TFieldValues, TContext, TTransformedValues>
  className?: string
}) {
  const root = form.formState.errors.root
  const message = root?.server?.message ?? root?.message

  if (!message) return null

  return <FieldError className={className}>{message}</FieldError>
}

/* ------------------------------------------------------------------ *
 * Base UI control adapters
 *
 * Base UI's controlled props differ from Radix's in three ways that each
 * silently break a hand-wired field:
 *
 *   1. `onCheckedChange` / `onValueChange` take (value, eventDetails), not a
 *      bare value or a DOM event.
 *   2. A single `Select` emits `null` when cleared, not "".
 *   3. Checkbox, Switch and Select render a hidden input and expose it as
 *      `inputRef`, not `ref` — pass RHF's ref to the wrong one and
 *      `shouldFocusError` quietly no-ops on those fields.
 * ------------------------------------------------------------------ */

/** Text-like controls: `Input`, `Textarea`, `InputGroup` inputs. */
export function inputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(control: FormControl<TFieldValues, TName>) {
  const { field, id } = control
  return {
    ...field,
    id,
    // An undefined value would flip the input from controlled to uncontrolled.
    value: (field.value ?? "") as string,
    "aria-invalid": control["aria-invalid"],
    "aria-describedby": control["aria-describedby"],
  }
}

function toggleProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(control: FormControl<TFieldValues, TName>) {
  const { field, id } = control
  return {
    id,
    name: field.name,
    checked: Boolean(field.value),
    // Drops Base UI's second `eventDetails` argument, which RHF would
    // otherwise receive as a stray change payload.
    onCheckedChange: (checked: boolean) => field.onChange(checked),
    onBlur: field.onBlur,
    disabled: field.disabled,
    inputRef: field.ref,
    "aria-invalid": control["aria-invalid"],
    "aria-describedby": control["aria-describedby"],
  }
}

/** `Checkbox`. */
export const checkboxProps = toggleProps

/** `Switch`. */
export const switchProps = toggleProps

/**
 * `Select`. Returns two groups because Base UI splits the concerns: state
 * lives on `Select` (the root), while the labelled, focusable element is
 * `SelectTrigger`.
 *
 *   const select = selectProps(c)
 *   <Select {...select.root}>
 *     <SelectTrigger {...select.trigger}><SelectValue /></SelectTrigger>
 *     ...
 *   </Select>
 */
export function selectProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(control: FormControl<TFieldValues, TName>) {
  const { field, id } = control
  return {
    root: {
      name: field.name,
      value: field.value ?? null,
      onValueChange: (value: unknown) => field.onChange(value ?? null),
      disabled: field.disabled,
      inputRef: field.ref,
    },
    trigger: {
      id,
      onBlur: field.onBlur,
      "aria-invalid": control["aria-invalid"],
      "aria-describedby": control["aria-describedby"],
    },
  }
}
