"use client"

import { useState } from "react"
import { ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Pricing } from "@/lib/types"

type Submission = {
  note: string
  pricing: Pricing
}

type Props = {
  onSubmit: (data: Submission) => void
}

type Mode = "fixed" | "range"

function InfoRequestForm({ onSubmit }: Props) {
  const [note, setNote] = useState("")
  const [mode, setMode] = useState<Mode>("range")
  const [fixed, setFixed] = useState<string>("")
  const [min, setMin] = useState<string>("")
  const [max, setMax] = useState<string>("")
  const [touched, setTouched] = useState(false)

  const noteOk = note.trim().length > 0
  const pricingOk =
    mode === "fixed"
      ? Number(fixed) > 0
      : Number(min) > 0 && Number(max) > 0 && Number(max) >= Number(min)
  const isValid = noteOk && pricingOk

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!isValid) return
    const pricing: Pricing =
      mode === "fixed"
        ? { kind: "fixed", amount: Number(fixed) }
        : { kind: "range", min: Number(min), max: Number(max) }
    onSubmit({ note: note.trim(), pricing })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-lg flex-col gap-6"
    >
      <div>
        <label htmlFor="note" className="mb-2 block font-display text-base">
          Quelles infos supplémentaires souhaitez-vous demander&nbsp;?
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="Ex&nbsp;: marque de l'appareil, photo du problème, créneau souhaité…"
          className="w-full resize-none rounded-2xl border border-border bg-card p-4 text-base leading-relaxed focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </div>

      <div>
        <span className="mb-2 block font-display text-base">
          Votre prétention
        </span>
        <div className="mb-3 inline-flex rounded-full border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setMode("range")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition",
              mode === "range"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Fourchette
          </button>
          <button
            type="button"
            onClick={() => setMode("fixed")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition",
              mode === "fixed"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Tarif fixe
          </button>
        </div>

        {mode === "fixed" ? (
          <PriceInput
            value={fixed}
            onChange={setFixed}
            placeholder="Tarif"
            id="fixed"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <PriceInput
              value={min}
              onChange={setMin}
              placeholder="Min"
              id="min"
            />
            <PriceInput
              value={max}
              onChange={setMax}
              placeholder="Max"
              id="max"
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        className="group inline-flex items-center justify-center gap-3 self-start rounded-full bg-primary px-7 py-4 text-base font-medium text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-primary/40"
      >
        Envoyer au client
        <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </button>

      {touched && !isValid && (
        <p className="text-sm text-muted-foreground">
          Merci de remplir ces deux informations avant d&apos;envoyer.
        </p>
      )}
    </form>
  )
}

function PriceInput({
  value,
  onChange,
  placeholder,
  id,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  id: string
}) {
  return (
    <div className="flex items-center rounded-2xl border border-border bg-card focus-within:ring-2 focus-within:ring-primary">
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent px-4 py-3 text-base focus:outline-none"
      />
      <span className="pr-4 text-sm text-muted-foreground">Ar</span>
    </div>
  )
}

export { InfoRequestForm }
