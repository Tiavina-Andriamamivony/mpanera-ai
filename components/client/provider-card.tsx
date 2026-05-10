"use client"

import Image from "next/image"
import { useState } from "react"
import { Check, MapPin, Sparkles, Star, StarHalf } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { Provider, ProviderAvailability } from "@/lib/types"

type Props = {
  provider: Provider
  selected: boolean
  onToggle: () => void
}

const ACCENT_PALETTES = [
  "bg-primary text-primary-foreground",
  "bg-accent text-accent-foreground",
  "bg-[oklch(0.879_0.169_91.605)] text-[oklch(0.21_0.04_165)]",
] as const

function pickPalette(seed: string) {
  let sum = 0
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i)
  return ACCENT_PALETTES[sum % ACCENT_PALETTES.length]
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75
  const stars = []
  for (let i = 0; i < full; i++) {
    stars.push(
      <Star
        key={`f-${i}`}
        className="size-4 fill-[oklch(0.879_0.169_91.605)] text-[oklch(0.879_0.169_91.605)]"
      />
    )
  }
  if (hasHalf) {
    stars.push(
      <StarHalf
        key="half"
        className="size-4 fill-[oklch(0.879_0.169_91.605)] text-[oklch(0.879_0.169_91.605)]"
      />
    )
  }
  for (let i = stars.length; i < 5; i++) {
    stars.push(<Star key={`e-${i}`} className="size-4 text-border" />)
  }
  return <span className="flex items-center gap-0.5">{stars}</span>
}

function AvailabilityBadge({
  availability,
}: {
  availability: ProviderAvailability
}) {
  if (availability.kind === "available") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
        <span className="size-1.5 rounded-full bg-primary" />
        Disponible
      </span>
    )
  }
  if (availability.kind === "near") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-2.5 py-1 text-xs font-medium text-accent-foreground">
        <MapPin className="size-3" />
        Proche · {availability.distanceKm} km
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.879_0.169_91.605/0.25)] px-2.5 py-1 text-xs font-medium text-[oklch(0.32_0.07_60)]">
      <Sparkles className="size-3" />
      Sous {availability.withinHours}h
    </span>
  )
}

function ProviderCard({ provider, selected, onToggle }: Props) {
  const [open, setOpen] = useState(false)
  const palette = pickPalette(provider.id)

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onToggle()
        }
      }}
      className={cn(
        "group relative flex cursor-pointer flex-col gap-4 rounded-3xl border border-border bg-card p-6 text-left shadow-sm transition",
        "hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10",
        selected && "shadow-xl ring-2 shadow-primary/20 ring-primary"
      )}
    >
      {selected && (
        <span className="absolute -top-2 -right-2 grid size-7 place-items-center rounded-full bg-primary text-primary-foreground shadow-md">
          <Check className="size-4" />
        </span>
      )}

      <div className="flex items-start gap-4">
        <div
          className={cn(
            "grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl font-display text-xl",
            palette
          )}
        >
          {provider.photoUrl ? (
            <Image
              src={provider.photoUrl}
              alt={provider.name}
              width={128}
              height={128}
              className="size-full object-cover"
            />
          ) : (
            getInitials(provider.name)
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-xl">{provider.name}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {provider.city}
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <Stars rating={provider.rating} />
            <span className="font-medium">
              {provider.rating.toLocaleString("fr-FR", {
                minimumFractionDigits: 1,
              })}
            </span>
            <span className="text-muted-foreground">
              · {provider.reviewCount} avis
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          {provider.category}
        </span>
        <AvailabilityBadge availability={provider.availability} />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(true)
            }}
            className="mt-auto self-start text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            En savoir plus
          </button>
        </DialogTrigger>
        <DialogContent
          className="max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "grid size-16 shrink-0 place-items-center rounded-2xl font-display text-xl",
                  palette
                )}
              >
                {getInitials(provider.name)}
              </div>
              <div>
                <DialogTitle className="font-display text-2xl">
                  {provider.name}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {provider.category} · {provider.city}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Stars rating={provider.rating} />
              <span className="font-medium">
                {provider.rating.toLocaleString("fr-FR", {
                  minimumFractionDigits: 1,
                })}
              </span>
              <span className="text-muted-foreground">
                · {provider.reviewCount} avis · {provider.yearsActive} ans
                d&apos;expérience
              </span>
            </div>
            <p className="font-serif leading-relaxed italic">{provider.bio}</p>
            <AvailabilityBadge availability={provider.availability} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { ProviderCard }
