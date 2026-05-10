"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Show, UserButton } from "@clerk/nextjs"

const HIDDEN_ON = ["/sign-in", "/sign-up"]

function SiteHeader() {
  const pathname = usePathname()

  if (HIDDEN_ON.some((prefix) => pathname?.startsWith(prefix))) {
    return null
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 px-6 py-3 backdrop-blur-md">
      <Link
        href="/"
        className="group flex items-center gap-2.5"
        aria-label="mpanera.ai — accueil"
      >
        <span className="relative grid size-9 place-items-center overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border transition group-hover:ring-primary/40">
          <Image
            src="/logo.png"
            alt=""
            width={72}
            height={72}
            priority
            className="size-7 object-contain"
          />
        </span>
        <span className="font-display text-lg leading-none tracking-tight">
          mpanera<span className="text-accent">.</span>ai
        </span>
      </Link>

      <div className="flex items-center gap-3">
        <Show when="signed-out">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-foreground hover:underline"
          >
            Se connecter
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-10 cursor-pointer items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-primary/40 sm:h-11 sm:px-5"
          >
            Créer un compte
          </Link>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  )
}

export { SiteHeader }
