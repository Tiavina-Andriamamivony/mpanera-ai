import type { Metadata } from "next"
import { Box, House, MessageSquareText, PanelsTopLeft, ReceiptText } from "lucide-react"

import { ProjectCards, type Project } from "@/components/ui/animated-project-cards"
import WorkspaceForm from "@/components/ui/form-layout"
import { InteractiveBrokerCard } from "@/components/ui/interactive-broker-card"
import { RoadmapCard, type RoadmapItem } from "@/components/ui/roadmap-card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getDemoProviderProfile } from "@/lib/demo-provider"

type ProviderDetailsPageProps = {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({
  params,
}: ProviderDetailsPageProps): Promise<Metadata> {
  const { id } = await params
  const profile = getDemoProviderProfile(id)
  return {
    title: `${profile.displayName} · Prestataire · Mpanera`,
    description: `${profile.category} — ${profile.rating.toFixed(1)}/5 (${profile.reviewCount} avis).`,
  }
}

export default async function ProviderDetailsPage({
  params,
}: ProviderDetailsPageProps) {
  const { id } = await params
  const profile = getDemoProviderProfile(id)
  const providerDemandProjects: Project[] = [
    {
      id: `${profile.id}-demande-1`,
      title: `Nouvelle mission de ${profile.category}`,
      pricePerHour: "Pretention salariale a confirmer",
      status: profile.isAvailable ? "Paid" : "Not Paid",
      categories: [
        profile.category,
        "Demande recue",
        profile.isNearby ? "Proche de vous" : "Zone urbaine",
      ],
      description:
        "Bonjour " +
        profile.displayName +
        ", une personne aurait besoin de vous. Le client explique son probleme en texte brut et attend une premiere lecture de la mission avant votre decision.",
      location: profile.isNearby ? "Antananarivo" : "Grande ville",
      timeAgo: "Demande recente",
      logoColor: profile.isAvailable ? "bg-orange-500" : "bg-gray-700",
      logoIcon: "M",
    },
    {
      id: `${profile.id}-demande-2`,
      title: "Probleme brut du client",
      pricePerHour: "Urgence et date souhaitee a verifier",
      status: "Not Paid" as const,
      categories: ["Texte brut", "Urgence moyenne", "Validation en attente"],
      description:
        "J'ai besoin d'aide rapidement pour un probleme relevant de " +
        profile.category.toLowerCase() +
        ". Merci de me dire si vous etes disponible, quelles informations supplementaires vous souhaitez recevoir, et si une intervention est possible a la date demandee.",
      location: profile.isNearby ? "Chez le client, a proximite" : "Intervention en ville",
      timeAgo: "Aujourd'hui",
      logoColor: "bg-blue-500",
      logoIcon: "!",
    },
  ]
  const providerResponseProjects: Project[] = [
    {
      id: `${profile.id}-reponse-1`,
      title: "Reponses du client recues",
      pricePerHour: "Formulaire dynamique complete par le client",
      status: "Paid",
      categories: [profile.category, "Reponses recues", "A verifier"],
      description:
        "Le client a repondu aux questions complementaires et a ajoute des precisions pour vous aider a evaluer la mission avant la confirmation finale.",
      location: profile.isNearby ? "Adresse communiquee a proximite" : "Intervention en ville",
      timeAgo: "Reponse recente",
      logoColor: "bg-orange-500",
      logoIcon: "R",
    },
    {
      id: `${profile.id}-reponse-2`,
      title: "Disponibilite et details du besoin",
      pricePerHour: "Date souhaitee et contraintes transmises",
      status: "Paid",
      categories: ["Date souhaitee", "Disponibilite", "Adresse"],
      description:
        "Le client confirme sa disponibilite, precise la date souhaitee et communique les informations utiles pour preparer l'intervention.",
      location: profile.isNearby ? "Chez le client" : "Zone d'intervention",
      timeAgo: "Aujourd'hui",
      logoColor: "bg-blue-500",
      logoIcon: "D",
    },
    {
      id: `${profile.id}-reponse-3`,
      title: "Precisions libres du client",
      pricePerHour: "Informations complementaires a relire",
      status: "Not Paid",
      categories: ["Texte libre", "Details techniques", "Validation en attente"],
      description:
        "Le client ajoute des precisions libres sur le probleme, les contraintes de lieu ou les specifications qu'il connait deja afin de vous aider a confirmer la prise en charge.",
      location: "Informations partagees par le client",
      timeAgo: "Derniere mise a jour",
      logoColor: "bg-gray-700",
      logoIcon: "C",
    },
  ]
  const providerConfirmationItems: RoadmapItem[] = [
    {
      quarter: "Etape 1",
      title: "Demande lue",
      description: "La mission et le probleme brut du client ont ete relus par le prestataire.",
      status: "done",
    },
    {
      quarter: "Etape 2",
      title: "Qualification prete",
      description:
        "Les informations supplementaires et la pretention salariale ont ete preparees.",
      status: "done",
    },
    {
      quarter: "Etape 3",
      title: "Reponses recues",
      description: "Le client a renvoye le formulaire dynamique avec ses precisions.",
      status: "in-progress",
    },
    {
      quarter: "Etape 4",
      title: "Confirmation finale",
      description: "Le prestataire doit maintenant confirmer avant l'ouverture de la messagerie.",
      status: "upcoming",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <InteractiveBrokerCard
        name={profile.displayName}
        logoSrc="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=600&q=80"
        tradableAssets={[
          profile.category,
          profile.isAvailable ? "Disponible" : "Occupé",
          profile.isNearby ? "Proche de vous" : "Grande ville",
        ]}
        rating={profile.rating}
        ratingText={profile.category}
        reviewsCount={String(profile.reviewCount)}
        accountsCount={String(profile.completedJobs)}
        learnMoreUrl="#"
        announcement={`Bonjour ${profile.displayName}, une personne aurait besoin de vous pour une mission de ${profile.category.toLowerCase()}.`}
      />

      <Tabs defaultValue="demande" className="mx-auto w-full">
        <ScrollArea>
          <TabsList className="mb-3 mx-auto gap-1 bg-transparent w-full">
            <TabsTrigger
              value="demande"
              className="rounded-md w-fit data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
            >
              <House
                className="-ms-0.5 me-1.5 opacity-60"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              Demande
            </TabsTrigger>
            <TabsTrigger
              value="qualification"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
            >
              <PanelsTopLeft
                className="-ms-0.5 me-1.5 opacity-60"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              Qualification
            </TabsTrigger>
            <TabsTrigger
              value="reponses"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
            >
              <Box
                className="-ms-0.5 me-1.5 opacity-60"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              Reponses client
            </TabsTrigger>
            <TabsTrigger
              value="confirmation"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
            >
              <ReceiptText
                className="-ms-0.5 me-1.5 opacity-60"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              Confirmation
            </TabsTrigger>
            <TabsTrigger
              value="messagerie"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
            >
              <MessageSquareText
                className="-ms-0.5 me-1.5 opacity-60"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              Messagerie
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <TabsContent value="demande">
          <ProjectCards projects={providerDemandProjects} />
        </TabsContent>
        <TabsContent value="qualification">
          <WorkspaceForm />
        </TabsContent>
        <TabsContent value="reponses">
          <ProjectCards projects={providerResponseProjects} />
        </TabsContent>
        <TabsContent value="confirmation">
          <div className="flex justify-center p-6">
            <RoadmapCard
              title="Confirmation finale de la mission"
              description="Derniere etape avant l'ouverture de la messagerie entre le client et le prestataire"
              items={providerConfirmationItems}
            />
          </div>
        </TabsContent>
        <TabsContent value="messagerie">
          <p className="p-4 pt-1 text-center text-xs text-muted-foreground">
            Conversation entre le client et le prestataire apres validation de la mission.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
