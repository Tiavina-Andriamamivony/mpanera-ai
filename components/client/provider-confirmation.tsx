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
            <span className="bg-primary/15 text-primary grid size-14 place-items-center rounded-full text-2xl">
              🌿
            </span>
            <p className="font-display text-2xl">Demande envoyée</p>
            <p className="text-muted-foreground font-serif italic">
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
              <DialogDescription className="text-muted-foreground font-serif italic">
                Ils recevront votre demande et vous reviendront très vite.
              </DialogDescription>
            </DialogHeader>

            <ul className="my-2 space-y-2">
              {providers.map((p, i) => (
                <li
                  key={p.id}
                  className="border-border bg-card flex items-center gap-3 rounded-2xl border p-3"
                >
                  <span
                    className={cn(
                      "grid size-10 place-items-center rounded-xl font-display text-sm shrink-0",
                      PALETTES[i % PALETTES.length]
                    )}
                  >
                    {getInitials(p.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="font-display truncate text-base">{p.name}</p>
                    <p className="text-muted-foreground truncate text-xs">
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
                className="bg-primary text-primary-foreground inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-primary/40"
              >
                Confirmer et envoyer
              </button>
              <button
                type="button"
                onClick={onEdit}
                className="border-border hover:bg-card inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-medium transition"
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
