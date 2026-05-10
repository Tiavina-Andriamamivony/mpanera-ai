import Link from "next/link"
import { ArrowLeftIcon, UserIcon } from "lucide-react"

import type { ClientProfile } from "@/lib/demo-client"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type ClientDetailViewProps = {
  profile: ClientProfile
}

export function ClientDetailView({ profile }: ClientDetailViewProps) {
  const initials = profile.displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")

  return (
    <div className="space-y-8">
      <Button variant="ghost" size="sm" className="w-fit gap-2 px-0" asChild>
        <Link href="/app">
          <ArrowLeftIcon className="size-4" />
          Retour au tableau de bord
        </Link>
      </Button>

      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Client
      </p>

      <Card>
        <CardHeader className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar className="size-20">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.id)}`}
              alt=""
            />
            <AvatarFallback className="text-lg font-semibold">
              {initials || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1">
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
              {profile.displayName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {profile.city} · Membre depuis {profile.memberSince}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
            <UserIcon className="size-4 text-muted-foreground" />
            <span>
              {profile.requestsCount} demande
              {profile.requestsCount > 1 ? "s" : ""} enregistrée
              {profile.requestsCount > 1 ? "s" : ""} (démo)
            </span>
          </div>
          <Separator />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/app/ai-form">Ouvrir le formulaire avec l&apos;IA</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/app">Retour à l&apos;application</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Identifiant&nbsp;:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">{profile.id}</code>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
