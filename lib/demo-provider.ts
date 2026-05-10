export type ProviderProfile = {
  id: string
  displayName: string
  category: string
  rating: number
  reviewCount: number
  isAvailable: boolean
  isNearby: boolean
  bio: string
  completedJobs: number
  yearsActive: number
}

const CATEGORIES = [
  "Plomberie",
  "Électricité",
  "Ménage & repassage",
  "Réparation d’appareils",
  "Jardinage",
  "Peinture & déco",
] as const

const BIOS = [
  "Artisan depuis plusieurs années, je privilégie le travail soigné et les explications claires avant de commencer.",
  "Interventions rapides à Antananarivo et environs, devis transparent et délais annoncés à l'avance.",
  "Spécialiste des dépannages urgents et des petits travaux du quotidien pour les foyers.",
] as const

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function slugToDisplayName(slug: string): string {
  try {
    const decoded = decodeURIComponent(slug)
    return decoded
      .split(/[-_]/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ")
  } catch {
    return slug
  }
}

export function getDemoProviderProfile(id: string): ProviderProfile {
  const h = hashString(id)
  const rating = Math.round((3.8 + (h % 12) / 10) * 10) / 10
  const reviewCount = 12 + (h % 180)
  const category = CATEGORIES[h % CATEGORIES.length]
  const bio = BIOS[h % BIOS.length]

  return {
    id,
    displayName: slugToDisplayName(id),
    category,
    rating,
    reviewCount,
    isAvailable: h % 5 !== 0,
    isNearby: h % 3 === 0,
    bio,
    completedJobs: 20 + (h % 200),
    yearsActive: 2 + (h % 12),
  }
}
