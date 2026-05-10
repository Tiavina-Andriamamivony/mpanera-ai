"use client"

import {
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react"
import { ArrowUp, Square } from "lucide-react"

import { cn } from "@/lib/utils"

const MAX_HEIGHT_PX = 200
const MIN_HEIGHT_PX = 56

type MpaneraPromptBoxProps = {
  onSend: (message: string) => void
  isLoading?: boolean
  placeholder?: string
  autoFocus?: boolean
  className?: string
  value?: string
  onValueChange?: (value: string) => void
}

function MpaneraPromptBox({
  onSend,
  isLoading = false,
  placeholder = "Décrivez votre besoin en quelques mots…",
  autoFocus,
  className,
  value,
  onValueChange,
}: MpaneraPromptBoxProps) {
  const isControlled = value !== undefined && onValueChange !== undefined
  const [internalValue, setInternalValue] = useState("")
  const currentValue = isControlled ? (value as string) : internalValue
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = "auto"
    const next = Math.min(
      Math.max(textarea.scrollHeight, MIN_HEIGHT_PX),
      MAX_HEIGHT_PX
    )
    textarea.style.height = `${next}px`
  }, [currentValue])

  const updateValue = (next: string) => {
    if (isControlled) {
      onValueChange?.(next)
    } else {
      setInternalValue(next)
    }
  }

  const trimmed = currentValue.trim()
  const isEmpty = trimmed.length === 0
  const isSubmitDisabled = isEmpty || isLoading

  const submit = () => {
    if (isSubmitDisabled) return
    onSend(trimmed)
    updateValue("")
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    updateValue(event.target.value)
  }

  return (
    <div
      className={cn(
        "flex items-end gap-2 rounded-3xl border border-border bg-card p-2 shadow-xl shadow-primary/5 transition",
        isLoading && "ring-2 ring-primary/40",
        className
      )}
    >
      <textarea
        ref={textareaRef}
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={1}
        className="max-h-[200px] min-h-[56px] flex-1 resize-none bg-transparent px-4 py-3 text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      <button
        type="button"
        onClick={submit}
        aria-label={isLoading ? "Interrompre la réponse" : "Envoyer le message"}
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90",
          isSubmitDisabled && "pointer-events-none opacity-40"
        )}
      >
        {isLoading ? (
          <Square className="size-4 fill-current" />
        ) : (
          <ArrowUp className="size-5" />
        )}
      </button>
    </div>
  )
}

export { MpaneraPromptBox }
