"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react"
import {
  ArrowUpIcon,
  CircleUserRound,
  FileUp,
  ImageIcon,
  MonitorIcon,
  Paperclip,
  PlusIcon,
} from "lucide-react"

import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface UseAutoResizeTextareaProps {
  minHeight: number
  maxHeight?: number
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return

      if (reset) {
        textarea.style.height = `${minHeight}px`
        return
      }

      textarea.style.height = `${minHeight}px`

      const newHeight = Math.max(
        minHeight,
        Math.min(
          textarea.scrollHeight,
          maxHeight ?? Number.POSITIVE_INFINITY
        )
      )

      textarea.style.height = `${newHeight}px`
    },
    [minHeight, maxHeight]
  )

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = `${minHeight}px`
    }
  }, [minHeight])

  useEffect(() => {
    const handleResize = () => adjustHeight()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [adjustHeight])

  return { textareaRef, adjustHeight }
}

export function VercelV0Chat() {
  const [value, setValue] = useState("")
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  })

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (value.trim()) {
        setValue("")
        adjustHeight(true)
      }
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1920px] flex-col items-center space-y-8 p-4">
      <h1 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Que puis-je faire pour vous&nbsp;?
      </h1>
      <p className="text-center text-base text-muted-foreground">
        Posez votre question ou décrivez votre besoin en une ou deux phrases…
      </p>

      <div className="w-full">
        <div className="relative rounded-lg border border-border bg-card shadow-sm">
          <div className="overflow-y-auto">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                adjustHeight()
              }}
              onKeyDown={handleKeyDown}
              placeholder="Décrivez votre besoin en une ou deux phrases…"
              className={cn(
                "min-h-[60px] w-full resize-none border-none bg-transparent px-4 py-3 text-sm text-foreground",
                "placeholder:text-muted-foreground",
                "focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              )}
              style={{ overflow: "hidden" }}
            />
          </div>

          <div className="flex items-center justify-between border-t border-border p-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="group flex items-center gap-1 rounded-lg p-2 transition-colors hover:bg-muted"
              >
                <Paperclip className="size-4 text-foreground" />
                <span className="hidden text-xs text-muted-foreground transition-opacity group-hover:inline">
                  Joindre
                </span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center justify-between gap-1 rounded-lg border border-dashed border-border px-2 py-1 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-muted"
              >
                <PlusIcon className="size-4" />
                Projet
              </button>
              <button
                type="button"
                className={cn(
                  "flex items-center justify-between gap-1 rounded-lg border px-1.5 py-1.5 text-sm transition-colors",
                  value.trim()
                    ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                <ArrowUpIcon
                  className={cn(
                    "size-4",
                    value.trim()
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                />
                <span className="sr-only">Envoyer</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <ActionButton
            icon={<ImageIcon className="size-4" />}
            label="Cloner une capture"
          />

          <ActionButton
            icon={<FileUp className="size-4" />}
            label="Importer un projet"
          />
          <ActionButton
            icon={<MonitorIcon className="size-4" />}
            label={"Page d'accueil"}
          />
          <ActionButton
            icon={<CircleUserRound className="size-4" />}
            label={"Formulaire d'inscription"}
          />
        </div>
      </div>
    </div>
  )
}

interface ActionButtonProps {
  icon: ReactNode
  label: string
}

function ActionButton({ icon, label }: ActionButtonProps) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
