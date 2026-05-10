export type ClientProfile = {
  id: string
  displayName: string
  city: string
  memberSince: string
  requestsCount: number
}

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

const CITIES = [
  "Antananarivo",
  "Antsirabe",
  "Toamasina",
  "Fianarantsoa",
  "Mahajanga",
] as const

export function getDemoClientProfile(id: string): ClientProfile {
  const h = hashString(id)
  return {
    id,
    displayName: slugToDisplayName(id),
    city: CITIES[h % CITIES.length],
    memberSince: `${2019 + (h % 5)}`,
    requestsCount: 1 + (h % 12),
  }
}
