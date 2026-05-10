"use client"

import { ArrowUpRight } from "lucide-react"

import type { ClientReply } from "@/lib/types"

type Props = {
  reply: ClientReply
  onConfirm: () => void
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-card rounded-2xl border p-5">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </p>
      <p className="font-display mt-1 text-lg">{value}</p>
    </div>
  )
}

function ClientReplies({ reply, onConfirm }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div>
        <h2 className="font-display text-3xl leading-tight sm:text-4xl">
          Le client <span className="text-primary italic">vous a répondu</span>.
        </h2>
        <p className="text-muted-foreground mt-2 font-serif italic">
          Voici toutes les précisions reçues.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Ville" value={reply.ville} />
        <Field label="Date souhaitée" value={reply.dateSouhaitee} />
        {reply.marqueAppareil && (
          <Field
            label="Marque / Appareil"
            value={reply.marqueAppareil}
          />
        )}
      </div>

      <div className="bg-secondary/60 border-accent rounded-2xl border-l-4 p-5">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Précision libre du client
        </p>
        <p className="mt-2 font-serif text-base leading-relaxed italic">
          « {reply.infoSupp} »
        </p>
      </div>

      <button
        type="button"
        onClick={onConfirm}
        className="bg-primary text-primary-foreground group mt-2 inline-flex items-center justify-center gap-3 self-start rounded-full px-7 py-4 text-base font-medium shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-primary/40"
      >
        Confirmer et démarrer la conversation
        <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </button>
    </div>
  )
}

export { ClientReplies }
