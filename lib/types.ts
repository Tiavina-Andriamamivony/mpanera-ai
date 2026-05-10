export type ProviderAvailability =
  | { kind: "available" }
  | { kind: "near"; distanceKm: number }
  | { kind: "soon"; withinHours: number }

export type Provider = {
  id: string
  name: string
  category: string
  rating: number
  reviewCount: number
  photoUrl?: string
  city: string
  yearsActive: number
  bio: string
  availability: ProviderAvailability
}

export type Pricing =
  | { kind: "fixed"; amount: number }
  | { kind: "range"; min: number; max: number }

export type MissionContext = {
  providerName: string
  problem: string
  category: string
}

export type ClientReply = {
  ville: string
  dateSouhaitee: string
  marqueAppareil?: string
  infoSupp: string
}
