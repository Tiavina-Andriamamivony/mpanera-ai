"use client"

import { useState } from "react"

import { ProviderConfirmation } from "@/components/client/provider-confirmation"
import { ProviderResults } from "@/components/client/provider-results"
import type { Provider } from "@/lib/types"

const MOCK_PROVIDERS: Provider[] = [
  {
    id: "p-voahangy",
    name: "Voahangy R.",
    category: "Couture",
    rating: 4.9,
    reviewCount: 142,
    city: "Antananarivo · Ambohibao",
    yearsActive: 12,
    bio: "Spécialiste robes de mariage et akanjo malagasy sur-mesure. Atelier familial à Ambohibao depuis 2013.",
    availability: { kind: "available" },
  },
  {
    id: "p-rakoto",
    name: "Rakoto H.",
    category: "Plomberie",
    rating: 4.7,
    reviewCount: 88,
    city: "Fianarantsoa",
    yearsActive: 9,
    bio: "Fuites, chauffe-eau, raccordements. Devis clair avant intervention. Travail soigné et durable.",
    availability: { kind: "near", distanceKm: 2 },
  },
  {
    id: "p-mahasoa",
    name: "Mahasoa N.",
    category: "Cours particuliers",
    rating: 4.8,
    reviewCount: 64,
    city: "Antananarivo",
    yearsActive: 6,
    bio: "Maths et physique, du collège au BACC. Pédagogie patiente, à domicile ou en visio.",
    availability: { kind: "soon", withinHours: 24 },
  },
  {
    id: "p-naivo",
    name: "Naivo A.",
    category: "Ménage",
    rating: 4.6,
    reviewCount: 211,
    city: "Toamasina",
    yearsActive: 4,
    bio: "Ménage régulier ou ponctuel. Sérieuse, ponctuelle, recommandée par tout le fokontany.",
    availability: { kind: "available" },
  },
  {
    id: "p-hery",
    name: "Hery T.",
    category: "Traiteur",
    rating: 4.4,
    reviewCount: 37,
    city: "Mahajanga",
    yearsActive: 7,
    bio: "Mariages, baptêmes, repas familiaux. Cuisine malagasy traditionnelle et menus modernes.",
    availability: { kind: "soon", withinHours: 48 },
  },
  {
    id: "p-fanja",
    name: "Fanja M.",
    category: "Électricité",
    rating: 4.3,
    reviewCount: 52,
    city: "Antsirabe",
    yearsActive: 11,
    bio: "Mises aux normes, tableaux électriques, dépannages. Intervention rapide en zone urbaine.",
    availability: { kind: "near", distanceKm: 5 },
  },
]

export default function ResultsPage() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selected = MOCK_PROVIDERS.filter((p) => selectedIds.has(p.id))

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
      <ProviderResults
        providers={MOCK_PROVIDERS}
        selectedIds={selectedIds}
        onToggle={toggle}
        onValidate={() => setConfirmOpen(true)}
      />
      <ProviderConfirmation
        open={confirmOpen}
        providers={selected}
        onClose={() => setConfirmOpen(false)}
        onEdit={() => setConfirmOpen(false)}
      />
    </main>
  )
}
