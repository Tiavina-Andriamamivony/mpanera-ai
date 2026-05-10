"use client"

import * as React from "react"
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import { MenuIcon, SearchIcon } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { SearchModal, type SearchModalItem } from "@/components/ui/search-modal"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { label: "Fonctionnalités", href: "#" },
  { label: "Tarifs", href: "#" },
  { label: "À propos", href: "#" },
] as const

const SEARCH_PLACEHOLDER_ITEMS: SearchModalItem[] = [
  {
    id: "blog-1",
    title: "L'avenir du web",
    description: "Un aperçu des technologies web à venir.",
    category: "Web",
  },
  {
    id: "blog-2",
    title: "Design minimaliste",
    description: "Moins peut souvent être plus en UI.",
    category: "Design",
  },
  {
    id: "blog-3",
    title: "Vitesse des pages",
    description: "Astuces pour un site plus rapide.",
    category: "Perf",
  },
  {
    id: "blog-4",
    title: "Introduction à TypeScript",
    description: "Pourquoi TypeScript sécurise le JavaScript.",
    category: "Code",
  },
  {
    id: "blog-5",
    title: "Mode sombre",
    description: "Bonnes pratiques pour un thème sombre.",
    category: "Design",
  },
  {
    id: "blog-6",
    title: "Comprendre les API",
    description: "REST et GraphQL pour débutants.",
    category: "Backend",
  },
  {
    id: "blog-7",
    title: "CSS Grid",
    description: "Mise en page avec la grille CSS.",
    category: "Frontend",
  },
  {
    id: "blog-8",
    title: "État dans React",
    description: "useState, contexte et options.",
    category: "Frontend",
  },
  {
    id: "blog-9",
    title: "SEO en 2026",
    description: "Tendances pour mieux se positionner.",
    category: "SEO",
  },
  {
    id: "blog-10",
    title: "Déboguer efficacement",
    description: "Outils et méthodes pour corriger plus vite.",
    category: "Code",
  },
]

type HeaderProps = {
  /** Ex. `SidebarTrigger` — doit vivre sous `SidebarProvider`. */
  leadingSlot?: React.ReactNode
}

export function Header({ leadingSlot }: HeaderProps) {
  const [sheetOpen, setSheetOpen] = React.useState(false)

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-[73px] w-full items-center border-b bg-black backdrop-blur-lg",
        "bg-background/95 supports-backdrop-filter:bg-background/80"
      )}
    >
      <nav className="flex h-14 w-full items-center justify-between px-4">
        <div className="flex max-w-[55%] min-w-0 items-center gap-1 sm:max-w-none sm:gap-2">
          {leadingSlot}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <SearchModal data={SEARCH_PLACEHOLDER_ITEMS}>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="relative cursor-pointer md:border xl:h-9 xl:w-60 xl:justify-between xl:px-3 xl:py-2"
              aria-label="Ouvrir la recherche"
            >
              <span className="hidden xl:inline-flex">Rechercher…</span>
              <span className="sr-only xl:hidden">Rechercher</span>
              <SearchIcon className="size-4" />
            </Button>
          </SearchModal>

          <div className="hidden items-center gap-1 lg:flex">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button type="button" variant="outline" size="sm">
                  Connexion
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button type="button" size="sm">
                  S&apos;inscrire
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>

          <Show when="signed-in">
            <div className="lg:hidden">
              <UserButton />
            </div>
          </Show>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                className="lg:hidden"
                aria-label="Ouvrir le menu"
              >
                <MenuIcon className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              className="gap-0 bg-background/95 backdrop-blur-lg supports-backdrop-filter:bg-background/80"
              showCloseButton={false}
              side="left"
            >
              <div className="grid gap-y-2 overflow-y-auto px-4 pt-12 pb-5">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    className={buttonVariants({
                      variant: "ghost",
                      className: "justify-start",
                    })}
                    href={link.href}
                    onClick={() => setSheetOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <Show when="signed-out">
                <SheetFooter>
                  <SignInButton mode="modal">
                    <Button type="button" variant="outline" className="w-full">
                      Connexion
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button type="button" className="w-full">
                      S&apos;inscrire
                    </Button>
                  </SignUpButton>
                </SheetFooter>
              </Show>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
