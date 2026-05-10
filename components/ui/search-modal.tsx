"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Modal,
  ModalContent,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/modal"
import { cn } from "@/lib/utils"

export type SearchModalItem = {
  id: string
  title: string
  description: string
  category: string
  icon?: LucideIcon
  shortcut?: string
}

type SearchModalProps = {
  children: React.ReactNode
  data: SearchModalItem[]
}

export function SearchModal({ children, data }: SearchModalProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent className="gap-0 p-1">
        <ModalTitle className="sr-only">Recherche</ModalTitle>
        <Command className="bg-background md:rounded-lg md:border">
          <CommandInput
            className={cn(
              "flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            )}
            placeholder="Rechercher…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList className="max-h-[380px] min-h-[380px] px-2 md:px-0">
            <CommandEmpty className="flex min-h-[280px] flex-col items-center justify-center">
              <SearchIcon className="mb-2 size-6 text-muted-foreground" />
              <p className="mb-1 text-xs text-muted-foreground">
                Aucun résultat pour « {query} »
              </p>
              <Button onClick={() => setQuery("")} variant="ghost">
                Effacer la recherche
              </Button>
            </CommandEmpty>
            <CommandGroup>
              {data.map((item) => {
                const Icon = item.icon
                return (
                  <CommandItem
                    key={item.id}
                    className="flex cursor-pointer items-center gap-3"
                    value={item.title}
                    onSelect={() => setOpen(false)}
                  >
                    {Icon ? <Icon className="size-5" /> : null}
                    <div className="flex min-w-0 flex-col">
                      <p className="max-w-[250px] truncate text-sm font-medium">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <p className="ml-auto text-xs text-muted-foreground">
                      {item.category}
                    </p>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </ModalContent>
    </Modal>
  )
}
