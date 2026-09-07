"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DateRange, Matcher } from "react-day-picker"

import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type CalendarProps = React.ComponentProps<typeof Calendar>

type DatePickerBaseProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placeholder?: React.ReactNode
  /** date-fns pattern used to render the selection on the trigger. */
  dateFormat?: string
  /** Disables the trigger. Use `disabledDates` to restrict selectable days. */
  disabled?: boolean
  disabledDates?: Matcher | Matcher[]
  align?: React.ComponentProps<typeof PopoverContent>["align"]
  side?: React.ComponentProps<typeof PopoverContent>["side"]
  id?: string
  className?: string
} & Pick<
  CalendarProps,
  "captionLayout" | "startMonth" | "endMonth" | "locale" | "showOutsideDays"
>

type DatePickerProps = DatePickerBaseProps & {
  value?: Date
  defaultValue?: Date
  onValueChange?: (date: Date | undefined) => void
  closeOnSelect?: boolean
}

type DateRangePickerProps = DatePickerBaseProps & {
  value?: DateRange
  defaultValue?: DateRange
  onValueChange?: (range: DateRange | undefined) => void
  /**
   * Closes the popover once both ends of the range are set. Defaults to
   * `resetOnSelect`, since the non-reset flow completes a range on the first
   * click and would close the popover immediately.
   */
  closeOnComplete?: boolean
  /**
   * Clicking a day starts a new range when none is started or one is already
   * complete. Defaults to `true` for the conventional click-start/click-end
   * flow; pass `false` for react-day-picker's extend-the-range behavior.
   */
  resetOnSelect?: boolean
  numberOfMonths?: number
  /** Minimum number of days the range must span. */
  min?: number
  /** Maximum number of days the range may span. */
  max?: number
}

function DatePicker({
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  placeholder = "Pick a date",
  dateFormat = "PPP",
  disabled,
  disabledDates,
  closeOnSelect = true,
  align = "start",
  side,
  id,
  className,
  ...calendarProps
}: DatePickerProps) {
  const [date, setDate] = useControllableState(
    value,
    defaultValue,
    onValueChange
  )
  const [isOpen, setIsOpen] = useControllableState(
    open,
    defaultOpen ?? false,
    onOpenChange
  )

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <DatePickerTrigger
        id={id}
        disabled={disabled}
        empty={!date}
        className={className}
      >
        {date ? format(date, dateFormat) : <span>{placeholder}</span>}
      </DatePickerTrigger>
      <PopoverContent className="w-auto p-0" align={align} side={side}>
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          disabled={disabledDates}
          onSelect={(selected) => {
            setDate(selected)
            if (closeOnSelect) {
              setIsOpen(false)
            }
          }}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  )
}

function DateRangePicker({
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  placeholder = "Pick a date range",
  dateFormat = "LLL dd, y",
  disabled,
  disabledDates,
  resetOnSelect = true,
  closeOnComplete = resetOnSelect,
  numberOfMonths = 2,
  min,
  max,
  align = "start",
  side,
  id,
  className,
  ...calendarProps
}: DateRangePickerProps) {
  const [range, setRange] = useControllableState(
    value,
    defaultValue,
    onValueChange
  )
  const [isOpen, setIsOpen] = useControllableState(
    open,
    defaultOpen ?? false,
    onOpenChange
  )

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <DatePickerTrigger
        id={id}
        disabled={disabled}
        empty={!range?.from}
        className={className}
      >
        {range?.from ? (
          range.to ? (
            <>
              {format(range.from, dateFormat)} - {format(range.to, dateFormat)}
            </>
          ) : (
            format(range.from, dateFormat)
          )
        ) : (
          <span>{placeholder}</span>
        )}
      </DatePickerTrigger>
      <PopoverContent className="w-auto p-0" align={align} side={side}>
        <Calendar
          mode="range"
          selected={range}
          defaultMonth={range?.from}
          disabled={disabledDates}
          numberOfMonths={numberOfMonths}
          resetOnSelect={resetOnSelect}
          min={min}
          max={max}
          onSelect={(selected) => {
            setRange(selected)
            if (closeOnComplete && selected?.from && selected.to) {
              setIsOpen(false)
            }
          }}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  )
}

function DatePickerTrigger({
  id,
  disabled,
  empty,
  className,
  children,
}: {
  id?: string
  disabled?: boolean
  empty: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <PopoverTrigger
      render={
        <Button
          variant="outline"
          id={id}
          disabled={disabled}
          data-empty={empty}
          className={cn(
            "w-full justify-start px-2.5 font-normal data-[empty=true]:text-muted-foreground",
            className
          )}
        />
      }
    >
      <CalendarIcon data-icon="inline-start" />
      {children}
    </PopoverTrigger>
  )
}

/**
 * Mirrors Base UI's controlled/uncontrolled convention: a prop that is defined
 * on the first render owns the state from then on, otherwise state is local.
 */
function useControllableState<T>(
  prop: T | undefined,
  defaultProp: T | undefined,
  onChange?: (value: T) => void
) {
  const [isControlled] = React.useState(() => prop !== undefined)
  const [uncontrolled, setUncontrolled] = React.useState(defaultProp)
  const state = isControlled ? prop : uncontrolled

  const setState = React.useCallback(
    (next: T | undefined) => {
      if (!isControlled) {
        setUncontrolled(next)
      }
      onChange?.(next as T)
    },
    [isControlled, onChange]
  )

  return [state, setState] as const
}

export { DatePicker, DateRangePicker }
export type { DatePickerProps, DateRangePickerProps }
