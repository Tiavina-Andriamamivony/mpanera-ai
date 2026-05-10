"use client"

import Link from "next/link"

function RefusedScreen() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5 text-center">
      <p className="font-display text-4xl leading-tight sm:text-5xl">
        Misaotra. Merci d&apos;avoir pris le temps de répondre.
      </p>
      <p className="max-w-md font-serif text-lg text-muted-foreground italic">
        Nous transmettons au client. À très vite pour une autre mission.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex items-center rounded-full border border-border px-7 py-3 text-base font-medium transition hover:bg-card"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}

export { RefusedScreen }
