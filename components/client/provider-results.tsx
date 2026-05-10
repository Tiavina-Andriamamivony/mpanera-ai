"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { ProviderCard } from "@/components/client/provider-card"
import { cn } from "@/lib/utils"
import type { Provider } from "@/lib/types"

type Props = {
  providers: Provider[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onValidate: () => void
}

function ProviderResults({
  providers,
  selectedIds,
  onToggle,
  onValidate,
}: Props) {
  const count = selectedIds.size
  const isEmpty = providers.length === 0
  const canValidate = count > 0

  return (
    <div className="relative">
      <header className="mb-10">
        <p className="border-border bg-card/60 mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-wide uppercase backdrop-blur">
          <span className="bg-primary size-1.5 rounded-full" />
          Sélection pour vous
        </p>
        <h1 className="font-display text-4xl leading-[0.95] sm:text-5xl">
          Voici qui peut <span className="text-primary italic">vous aider</span>
          .
        </h1>
        <p className="text-muted-foreground mt-4 max-w-xl font-serif text-lg italic">
          Choisissez une ou plusieurs personnes. Elles recevront votre demande
          en même temps.
        </p>
      </header>

      {isEmpty ? (
        <div className="border-border bg-card mx-auto flex max-w-xl flex-col items-center gap-5 rounded-3xl border p-12 text-center">
          <p className="font-display text-2xl">
            Personne ne semble disponible pour l&apos;instant.
          </p>
          <p className="text-muted-foreground">
            Essayez de reformuler votre besoin avec d&apos;autres mots.
          </p>
          <Link
            href="/client/discussion"
            className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-primary/40"
          >
            Reformuler
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      ) : (
        <ul className="grid gap-5 pb-32 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <li key={provider.id}>
              <ProviderCard
                provider={provider}
                selected={selectedIds.has(provider.id)}
                onToggle={() => onToggle(provider.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {!isEmpty && (
        <div className="from-background via-background/95 fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t to-transparent px-6 pt-10 pb-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 lg:px-4">
            <p
              className={cn(
                "text-sm transition",
                count === 0 ? "text-muted-foreground" : "text-foreground"
              )}
            >
              {count === 0
                ? "Sélectionnez au moins une personne pour continuer."
                : count === 1
                  ? "1 prestataire sélectionné"
                  : `${count} prestataires sélectionnés`}
            </p>
            <button
              type="button"
              onClick={onValidate}
              disabled={!canValidate}
              className={cn(
                "bg-primary text-primary-foreground group inline-flex items-center gap-3 rounded-full px-7 py-4 text-base font-medium shadow-lg shadow-primary/20 transition",
                canValidate
                  ? "hover:-translate-y-0.5 hover:shadow-primary/40"
                  : "pointer-events-none opacity-40"
              )}
            >
              Valider ma sélection
              <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export { ProviderResults }
