import Link from "next/link"
import { ArrowLeftIcon, MapPinIcon, StarIcon } from "lucide-react"

import type { ProviderProfile } from "@/lib/demo-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

function RatingRow({
  rating,
  reviewCount,
}: {
  rating: number
  reviewCount: number
}) {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.45 && rating - full < 1

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      aria-label={`Note ${rating.toFixed(1)} sur 5, ${reviewCount} avis`}
    >
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => {
          const filled = i < full
          const half = !filled && i === full && hasHalf
          return (
            <StarIcon
              key={i}
              className={cn(
                "size-5 shrink-0",
                filled && "fill-amber-400 text-amber-400",
                half && "fill-amber-400/60 text-amber-400",
                !filled && !half && "text-muted"
              )}
            />
          )
        })}
      </div>
      <span className="font-medium text-foreground tabular-nums">
        {rating.toFixed(1)}
      </span>
      <span className="text-sm text-muted-foreground">
        ({reviewCount} avis)
      </span>
    </div>
  )
}

type ProviderDetailViewProps = {
  profile: ProviderProfile
}

export function ProviderDetailView({ profile }: ProviderDetailViewProps) {
  const initials = profile.displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")

  const avatarSeed = encodeURIComponent(profile.id)

  return (
    <div className="mx-auto space-y-4 bg-orange-100">
      <p className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
        Prestataire
      </p>

      <Card className="overflow-hidden border-border/80 shadow">
        <CardHeader className="gap-6 border-b border-border bg-muted/20 pb-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <Avatar
              size="lg"
              className="size-28 ring-4 ring-background md:size-32"
            >
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                alt=""
              />
              <AvatarFallback className="text-2xl font-semibold">
                {initials || "?"}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 space-y-4">
              <div className="space-y-2">
                <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {profile.displayName}
                </h1>
                <p className="text-base text-muted-foreground">
                  {profile.category}
                </p>
              </div>

              <RatingRow
                rating={profile.rating}
                reviewCount={profile.reviewCount}
              />

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{profile.category}</Badge>
                {profile.isAvailable ? (
                  <Badge className="bg-primary/15 text-primary hover:bg-primary/20">
                    Disponible
                  </Badge>
                ) : (
                  <Badge variant="outline">Occupé</Badge>
                )}
                {profile.isNearby ? (
                  <Badge variant="outline" className="gap-1">
                    <MapPinIcon className="size-3" />
                    Proche de vous
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <MapPinIcon className="size-3" />
                    Grande ville
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pt-8">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-center sm:text-left">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Missions réalisées
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {profile.completedJobs}+
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-center sm:text-left">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Expérience
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {profile.yearsActive} ans
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-center sm:text-left">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Réactivité
              </p>
              <p className="mt-1 text-lg font-semibold">Sous 24 h</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h2 className="font-heading text-lg font-medium">Présentation</h2>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {profile.bio}
            </p>
          </div>

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/app/ai-form">Décrire mon besoin avec l&apos;IA</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              asChild
            >
              <Link href="/app">Voir d&apos;autres prestataires</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Identifiant&nbsp;:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">{profile.id}</code>{" "}
            · Les données ci-dessus sont des exemples pour la démo (USER_ROADMAP
            §1.5).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
