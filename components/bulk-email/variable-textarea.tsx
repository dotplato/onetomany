"use client"

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ComponentProps,
} from "react"

import { cn } from "@/lib/utils"
import { isVariableToken, splitVariableTokens } from "@/lib/variables"

interface VariableTextareaProps extends Omit<
  ComponentProps<"textarea">,
  "className"
> {
  className?: string
  containerClassName?: string
}

function renderHighlightedText(text: string) {
  return splitVariableTokens(text).map((part, index) => {
    if (isVariableToken(part)) {
      return (
        <span key={index} className="font-semibold text-primary">
          {part}
        </span>
      )
    }

    return <span key={index}>{part}</span>
  })
}

const VariableTextarea = forwardRef<HTMLTextAreaElement, VariableTextareaProps>(
  function VariableTextarea(
    {
      value = "",
      onChange,
      onScroll,
      placeholder,
      rows = 10,
      id,
      className,
      containerClassName,
      ...props
    },
    ref
  ) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const backdropRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement)

    const handleScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
      if (backdropRef.current) {
        backdropRef.current.scrollTop = event.currentTarget.scrollTop
        backdropRef.current.scrollLeft = event.currentTarget.scrollLeft
      }
      onScroll?.(event)
    }

    const textValue = String(value)

    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-transparent bg-input/50 transition-[color,box-shadow] duration-200 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30",
          containerClassName
        )}
      >
        <div
          ref={backdropRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words px-2.5 py-2 font-mono text-sm leading-normal text-foreground"
        >
          {textValue ? (
            renderHighlightedText(textValue)
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>

        <textarea
          ref={textareaRef}
          id={id}
          data-slot="textarea"
          value={value}
          onChange={onChange}
          onScroll={handleScroll}
          rows={rows}
          spellCheck={false}
          className={cn(
            "relative block field-sizing-content min-h-16 w-full resize-none bg-transparent px-2.5 py-2 font-mono text-sm leading-normal text-transparent caret-foreground outline-none disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

export { VariableTextarea }
