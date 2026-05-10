"use client"

import { Sparkles } from "lucide-react"

type Props = {
  onAccept: () => void
  onRefuse: () => void
}

function DecisionButtons({ onAccept, onRefuse }: Props) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <button
        type="button"
        onClick={onAccept}
        className="bg-primary text-primary-foreground group inline-flex h-12 items-center gap-2 rounded-full px-7 text-base font-medium shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-primary/40"
      >
        <Sparkles className="size-4" />
        J&apos;accepte
      </button>
      <button
        type="button"
        onClick={onRefuse}
        className="border-border hover:bg-card inline-flex h-12 items-center rounded-full border px-7 text-base font-medium transition"
      >
        Je ne suis pas dispo
      </button>
    </div>
  )
}

export { DecisionButtons }
