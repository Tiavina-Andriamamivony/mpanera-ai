"use client"

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
    <header className="flex h-16 items-center justify-end gap-4 p-4">
      <Show when="signed-out">
        <Link
          href="/sign-in"
          className="text-sm font-medium text-foreground hover:underline"
        >
          Se connecter
        </Link>
        <Link
          href="/sign-up"
          className="inline-flex h-10 cursor-pointer items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground sm:h-12 sm:px-5 sm:text-base"
        >
          Créer un compte
        </Link>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </header>
  )
}

export { SiteHeader }
