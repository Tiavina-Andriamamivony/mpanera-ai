import type { Metadata } from "next"

import { ClientDetailView } from "@/components/client-detail-view"
import { getDemoClientProfile } from "@/lib/demo-client"

type ClientDetailsPageProps = {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({
  params,
}: ClientDetailsPageProps): Promise<Metadata> {
  const { id } = await params
  const profile = getDemoClientProfile(id)
  return {
    title: `${profile.displayName} · Client · Mpanera`,
    description: `Fiche client — ${profile.city}.`,
  }
}

export default async function ClientDetailsPage({
  params,
}: ClientDetailsPageProps) {
  const { id } = await params
  const profile = getDemoClientProfile(id)

  return <ClientDetailView profile={profile} />
}
