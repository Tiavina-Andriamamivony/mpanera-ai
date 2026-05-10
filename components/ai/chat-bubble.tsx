"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type ChatBubbleProps = {
  role: "user" | "ai"
  pending?: boolean
  children: ReactNode
}

const BUBBLE_BY_ROLE = {
  user: "ml-auto rounded-br-sm bg-primary text-primary-foreground",
  ai: "rounded-bl-sm bg-secondary text-secondary-foreground",
} as const

function ChatBubble({ role, pending = false, children }: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed",
        BUBBLE_BY_ROLE[role]
      )}
    >
      {children}
      {pending && (
        <span className="ml-1 inline-flex gap-0.5 align-middle">
          <span
            className="inline-block size-1 animate-bounce rounded-full bg-current opacity-60"
            style={{ animationDelay: "0s" }}
          />
          <span
            className="inline-block size-1 animate-bounce rounded-full bg-current opacity-60"
            style={{ animationDelay: "0.15s" }}
          />
          <span
            className="inline-block size-1 animate-bounce rounded-full bg-current opacity-60"
            style={{ animationDelay: "0.3s" }}
          />
        </span>
      )}
    </div>
  )
}

export { ChatBubble }
