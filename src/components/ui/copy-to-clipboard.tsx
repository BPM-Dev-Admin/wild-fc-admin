"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { cn } from "cn"
import { Button, type buttonVariants } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { notify } from "@/components/ui/toast"
import type { VariantProps } from "class-variance-authority"

interface CopyToClipboardProps
  extends Omit<
    React.ComponentProps<typeof Button>,
    "onClick" | "children" | "size" | "variant"
  > {
  /** The value to copy to the clipboard. */
  value: string
  /** `icon` shows only the copy icon. `text` shows the icon and the label "Copy". Defaults to `icon`. */
  display?: "icon" | "text"
  /** How long the "copied" state is shown, in milliseconds. */
  resetDelay?: number
  size?: VariantProps<typeof buttonVariants>["size"]
}

function CopyToClipboard({
  value,
  display = "icon",
  resetDelay = 1500,
  className,
  size,
  ...props
}: CopyToClipboardProps) {
  const [copied, setCopied] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  React.useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), resetDelay)
    } catch {
      notify("error", "Couldn't copy to clipboard.")
    }
  }

  const Icon = copied ? CheckIcon : CopyIcon

  if (display === "text") {
    return (
      <Button
        type="button"
        variant="outline"
        size={size ?? "sm"}
        className={cn(className)}
        onClick={handleCopy}
        {...props}
      >
        <Icon data-icon="inline-start" />
        {copied ? "Copied" : "Copy"}
      </Button>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size={size ?? "icon-sm"}
            className={cn(className)}
            onClick={handleCopy}
            aria-label={copied ? "Copied" : "Copy to clipboard"}
            {...props}
          >
            <Icon />
          </Button>
        }
      />
      <TooltipContent>{copied ? "Copied!" : "Copy"}</TooltipContent>
    </Tooltip>
  )
}

export { CopyToClipboard }
