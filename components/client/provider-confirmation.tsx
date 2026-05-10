"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { Provider } from "@/lib/types"

type Props = {
  open: boolean
  providers: Provider[]
  onClose: () => void
  onEdit: () => void
}

const PALETTES = [
  "bg-primary text-primary-foreground",
  "bg-accent text-accent-foreground",
  "bg-[oklch(0.879_0.169_91.605)] text-[oklch(0.21_0.04_165)]",
] as const

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function ProviderConfirmation({ open, providers, onClose, onEdit }: Props) {
  const router = useRouter()
  const [sent, setSent] = useState(false)
  const count = providers.length

  useEffect(() => {
    if (!open) setSent(false)
  }, [open])

  const handleConfirm = () => {
    console.info(
      "[provider-results] confirm",
      providers.map((p) => p.id)
    )
    setSent(true)
    setTimeout(() => {
      onClose()
      router.push("/")
    }, 2500)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        {sent ? (
          <div
            role="status"
            className="flex flex-col items-center gap-3 py-6 text-center"
          >
            <span className="grid size-14 place-items-center rounded-full bg-primary/15 text-2xl text-primary">
              🌿
            </span>
            <p className="font-display text-2xl">Demande envoyée</p>
            <p className="font-serif text-muted-foreground italic">
              Misaotra betsaka. Ils vous reviendront très vite.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                Vous allez contacter {count}{" "}
                {count > 1 ? "prestataires" : "prestataire"}.
              </DialogTitle>
              <DialogDescription className="font-serif text-muted-foreground italic">
                Ils recevront votre demande et vous reviendront très vite.
              </DialogDescription>
            </DialogHeader>

            <ul className="my-2 space-y-2">
              {providers.map((p, i) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
                >
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-xl font-display text-sm",
                      PALETTES[i % PALETTES.length]
                    )}
                  >
                    {getInitials(p.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display text-base">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.category} · {p.city}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-2 sm:flex-row-reverse sm:items-center sm:justify-start">
              <button
                type="button"
                onClick={handleConfirm}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-primary/40"
              >
                Confirmer et envoyer
              </button>
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium transition hover:bg-card"
              >
                Modifier ma sélection
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { ProviderConfirmation }
