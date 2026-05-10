"use client"

import Link from "next/link"
import { ArrowUpRight, Heart } from "lucide-react"

type Props = {
  providerName: string
}

function ProviderRefusedNotice({ providerName }: Props) {
  return (
    <div className="border-border bg-card relative overflow-hidden rounded-3xl border p-7 shadow-sm">
      <div
        aria-hidden
        className="absolute -top-16 -right-16 size-48 rounded-full bg-accent/20 blur-3xl"
      />
      <div className="relative flex items-start gap-4">
        <span className="bg-accent/20 text-accent-foreground grid size-11 place-items-center rounded-full">
          <Heart className="size-5" />
        </span>
        <div className="flex-1">
          <p className="font-display text-xl leading-snug">
            Malheureusement, {providerName} n&apos;est pas disponible pour ce
            besoin.
          </p>
          <p className="text-muted-foreground mt-2 font-serif italic">
            Nous vous invitons à sélectionner d&apos;autres professionnels
            — il y en a sûrement d&apos;autres très bien.
          </p>
          <Link
            href="/client/discussion/results"
            className="bg-primary text-primary-foreground mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium shadow-md shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-primary/40"
          >
            Voir d&apos;autres prestataires
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export { ProviderRefusedNotice }
