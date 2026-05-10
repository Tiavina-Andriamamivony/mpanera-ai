"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  Wrench,
  Zap,
  Scissors,
  SprayCan,
  GraduationCap,
  ChefHat,
} from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { Preloader } from "@/components/landing/preloader"
import { SiriOrb } from "@/components/ui/siri-orb"
import { isRole, routeForRole } from "@/lib/routes"

interface AuthCtas {
  primary: { href: string; label: string }
  secondary: { href: string; label: string }
  isSignedIn: boolean
}

function useAuthCtas(): AuthCtas {
  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded || !isSignedIn) {
    return {
      primary: { href: "/sign-up", label: "Décrire mon besoin" },
      secondary: { href: "/sign-up", label: "Je suis prestataire" },
      isSignedIn: false,
    }
  }

  const roleValue = user?.unsafeMetadata?.role
  const role = isRole(roleValue) ? roleValue : "client"
  const home = routeForRole(role)

  return {
    primary: {
      href: home,
      label:
        role === "provider" ? "Voir mes demandes" : "Reprendre ma recherche",
    },
    secondary: { href: home, label: "Mon espace" },
    isSignedIn: true,
  }
}

function LandingPage() {
  return (
    <>
      <Preloader />
      <main className="relative overflow-hidden bg-background text-foreground">
        <BackgroundDecor />
        <Hero />
        <HowItWorks />
        <Categories />
        <Trust />
        <Voices />
        <FinalCta />
        <Footer />
      </main>
    </>
  )
}

function BackgroundDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute -top-40 -left-40 size-[36rem] rounded-full bg-[oklch(0.769_0.188_70.08/0.18)] blur-3xl" />
      <div className="absolute top-1/3 -right-40 size-[40rem] rounded-full bg-[oklch(0.508_0.118_165.612/0.18)] blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
}

function Hero() {
  const ctas = useAuthCtas()
  return (
    <section className="relative mx-auto grid min-h-[88vh] max-w-7xl grid-cols-1 items-center gap-12 px-6 pt-12 pb-20 lg:grid-cols-12 lg:px-10">
      <div className="lg:col-span-7">
        <p className="reveal mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 py-1.5 pr-4 pl-1.5 text-xs font-medium tracking-wide uppercase backdrop-blur">
          <span className="grid size-7 place-items-center overflow-hidden rounded-full bg-primary text-primary-foreground shadow-sm shadow-primary/30">
            <Image
              src="/logo.png"
              alt=""
              width={56}
              height={56}
              priority
              className="size-5 object-contain"
            />
          </span>
          Madagascar — propulsé par l&apos;IA
          <span className="ml-1 size-1.5 rounded-full bg-accent" />
        </p>

        <h1 className="reveal font-display text-[clamp(3.25rem,10vw,8.5rem)] leading-[0.88] tracking-[-0.04em]">
          Trouvez le bon
          <br />
          <span className="relative inline-block">
            <span className="relative z-10 italic">prestataire</span>
            <span className="absolute inset-x-0 bottom-2 -z-0 h-4 bg-accent/60" />
          </span>
          ,
          <br />
          <span className="text-primary">parlez,</span> c&apos;est fait.
        </h1>

        <p className="reveal mt-10 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Plombier, couturière, électricien, prof, traiteur — décrivez ce dont
          vous avez besoin avec vos mots. Notre IA trouve les bonnes personnes
          près de chez vous, en français ou en malagasy.
        </p>

        <div className="reveal mt-10 flex flex-wrap items-center gap-3">
          <Link
            href={ctas.primary.href}
            className="group inline-flex items-center gap-3 rounded-full bg-primary px-7 py-4 text-base font-medium text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-primary/40"
          >
            {ctas.primary.label}
            <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          {!ctas.isSignedIn && (
            <Link
              href={ctas.secondary.href}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-7 py-4 text-base font-medium backdrop-blur transition hover:bg-card"
            >
              {ctas.secondary.label}
            </Link>
          )}
        </div>

        <div className="reveal mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
          <Stat value="2 400+" label="prestataires vérifiés" />
          <Stat value="18" label="régions couvertes" />
          <Stat value="4,8/5" label="satisfaction client" />
        </div>
      </div>

      <aside className="reveal lg:col-span-5">
        <HeroOrb />
      </aside>
    </section>
  )
}

function HeroOrb() {
  return (
    <div className="relative isolate mx-auto flex w-full max-w-md flex-col items-center">
      <div className="absolute -top-2 right-4 z-20 rotate-[6deg] rounded-2xl bg-accent px-4 py-2 font-display text-sm text-accent-foreground shadow-xl">
        Salama ô !
      </div>
      <div className="absolute -right-6 bottom-24 z-20 -rotate-[4deg] rounded-2xl border border-border bg-card px-4 py-2 font-serif text-sm italic shadow-xl">
        « Notre IA vous écoute »
      </div>
      <SiriOrb
        size="320px"
        animationDuration={28}
        className="drop-shadow-[0_30px_60px_oklch(0.508_0.118_165.612/0.35)]"
      />
      <div className="absolute top-1/2 left-1/2 z-10 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-background/80 shadow-[0_8px_30px_oklch(0.21_0.04_165/0.25)] ring-1 ring-border backdrop-blur">
        <Image
          src="/logo.png"
          alt="mpanera.ai"
          width={120}
          height={120}
          priority
          className="size-14 object-contain"
        />
      </div>
      <p className="mt-8 max-w-xs text-center font-serif text-sm text-muted-foreground">
        Une présence chaleureuse, qui parle votre langue, et qui sait écouter.
      </p>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-display text-3xl text-foreground">{value}</span>
      <span>{label}</span>
    </div>
  )
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Vous décrivez",
      body: "Avec vos mots, en français ou en malagasy. Pas de formulaire compliqué.",
    },
    {
      n: "02",
      title: "L'IA comprend",
      body: "Elle pose les bonnes questions et trouve les prestataires qui correspondent vraiment.",
    },
    {
      n: "03",
      title: "Vous choisissez",
      body: "Profils vérifiés, prix transparents, avis vrais. Vous décidez.",
    },
  ]

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10">
      <div className="mb-16 flex items-end justify-between gap-8">
        <h2 className="font-display text-5xl leading-[0.95] sm:text-6xl">
          Trois étapes,
          <br />
          <span className="text-primary italic">zéro complication.</span>
        </h2>
        <p className="hidden max-w-xs text-muted-foreground sm:block">
          Conçu pour tout le monde, pas seulement pour ceux qui sont à
          l&apos;aise avec le digital.
        </p>
      </div>

      <ol className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-3">
        {steps.map((s) => (
          <li
            key={s.n}
            className="group relative bg-card p-8 transition hover:bg-secondary"
          >
            <span className="font-display text-7xl text-accent">{s.n}</span>
            <h3 className="mt-4 font-display text-2xl">{s.title}</h3>
            <p className="mt-3 text-muted-foreground">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

const CATEGORIES = [
  {
    icon: Wrench,
    name: "Plomberie",
    body: "Fuites, robinets, chauffe-eau, installations.",
  },
  {
    icon: Zap,
    name: "Électricité",
    body: "Pannes, prises, tableaux, mise aux normes.",
  },
  {
    icon: Scissors,
    name: "Couture",
    body: "Retouches, sur-mesure, robes, akanjo malagasy.",
  },
  {
    icon: SprayCan,
    name: "Ménage",
    body: "À l'heure ou au forfait, ponctuel ou régulier.",
  },
  {
    icon: GraduationCap,
    name: "Cours particuliers",
    body: "Maths, langues, BEPC, BACC, à domicile ou en ligne.",
  },
  {
    icon: ChefHat,
    name: "Traiteur",
    body: "Mariages, anniversaires, repas du quotidien.",
  },
]

function Categories() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10">
      <div className="mb-14 max-w-2xl">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium tracking-wide uppercase">
          <span className="size-1.5 rounded-full bg-primary" />
          Quelques services
        </p>
        <h2 className="font-display text-5xl leading-[0.95] sm:text-6xl">
          Tout ce qu&apos;il vous faut,
          <br />
          <span className="text-primary italic">en quelques mots.</span>
        </h2>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map(({ icon: Icon, name, body }) => (
          <li
            key={name}
            className="group relative overflow-hidden rounded-3xl bg-secondary p-7 transition hover:-translate-y-1 hover:bg-card hover:shadow-xl hover:shadow-primary/5"
          >
            <span
              aria-hidden
              className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 transition group-hover:opacity-100"
            />
            <div className="grid size-12 place-items-center rounded-2xl bg-accent/15 text-accent-foreground">
              <Icon className="size-5 text-[oklch(0.555_0.163_48.998)]" />
            </div>
            <h3 className="mt-5 font-serif text-2xl">{name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {body}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm text-muted-foreground">
        … et bien d&apos;autres. Si vous ne trouvez pas, dites-le simplement à
        l&apos;IA.
      </p>
    </section>
  )
}

function Trust() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="font-display text-5xl leading-[0.95] sm:text-6xl">
            La confiance,
            <br />
            ça se voit.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Chaque prestataire est vérifié à la main. Les prix sont annoncés
            d&apos;avance. Les avis viennent de vrais clients.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
          <TrustCard
            icon={<ShieldCheck className="size-5" />}
            title="Profils vérifiés"
            body="Pièces d'identité contrôlées, références demandées."
          />
          <TrustCard
            icon={<Sparkles className="size-5" />}
            title="Prix transparents"
            body="Devis clair avant tout engagement, pas de surprise."
          />
          <TrustCard
            icon={<MessageCircle className="size-5" />}
            title="Conversations gardées"
            body="Tout l'historique reste accessible, pour vous et pour eux."
            wide
          />
        </div>
      </div>
    </section>
  )
}

function TrustCard({
  icon,
  title,
  body,
  wide,
}: {
  icon: React.ReactNode
  title: string
  body: string
  wide?: boolean
}) {
  return (
    <div
      className={`rounded-3xl border border-border bg-card p-6 ${wide ? "sm:col-span-2" : ""}`}
    >
      <div className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 font-serif text-xl">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  )
}

const VOICES = [
  {
    name: "Mahasoa",
    role: "Cliente",
    city: "Antananarivo",
    quote:
      "J'ai trouvé une couturière dans mon fokontany en cinq minutes. Elle a refait la robe de ma fille pour le mariage.",
    accent: "primary" as const,
    rotate: "-rotate-1",
  },
  {
    name: "Voahangy",
    role: "Couturière",
    city: "Toamasina",
    quote:
      "Avant, je vivais du bouche-à-oreille du quartier. Maintenant j'ai des clientes que je n'aurais jamais croisées.",
    accent: "accent" as const,
    rotate: "rotate-1",
  },
  {
    name: "Rakoto",
    role: "Plombier",
    city: "Fianarantsoa",
    quote:
      "L'IA explique au client ce qu'il a, donc quand j'arrive je sais déjà quoi faire. Ça nous fait gagner du temps à tous les deux.",
    accent: "gold" as const,
    rotate: "-rotate-[0.5deg]",
  },
]

function Voices() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10">
      <div className="mb-14 max-w-2xl">
        <h2 className="font-display text-5xl leading-[0.95] sm:text-6xl">
          <span className="text-primary italic">Des vraies personnes,</span>
          <br />
          de vrais résultats.
        </h2>
        <p className="mt-6 text-muted-foreground">
          Des clients et des prestataires de toute l&apos;île, qui ont essayé et
          qui en parlent.
        </p>
      </div>

      <ul className="grid gap-6 md:grid-cols-3">
        {VOICES.map((v) => (
          <li
            key={v.name}
            className={`relative rounded-3xl border border-border bg-card p-7 shadow-xl shadow-primary/5 transition hover:shadow-primary/15 ${v.rotate} hover:rotate-0`}
          >
            <p className="font-serif text-lg leading-relaxed italic">
              « {v.quote} »
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Initials name={v.name} accent={v.accent} />
              <div className="text-sm">
                <p className="font-display text-base">{v.name}</p>
                <p className="text-muted-foreground">
                  {v.role} · {v.city}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Initials({
  name,
  accent,
}: {
  name: string
  accent: "primary" | "accent" | "gold"
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")

  const palette: Record<typeof accent, string> = {
    primary: "bg-primary text-primary-foreground",
    accent: "bg-accent text-accent-foreground",
    gold: "bg-[oklch(0.879_0.169_91.605)] text-[oklch(0.21_0.04_165)]",
  }

  return (
    <span
      className={`grid size-11 place-items-center rounded-full font-display text-base ${palette[accent]}`}
    >
      {initials}
    </span>
  )
}

function FinalCta() {
  const ctas = useAuthCtas()
  return (
    <section className="relative mx-auto mb-24 max-w-7xl px-6 lg:px-10">
      <div className="relative overflow-hidden rounded-[2rem] bg-primary px-8 py-16 text-primary-foreground sm:px-16 sm:py-24">
        <div
          aria-hidden
          className="absolute -top-24 -right-24 size-[24rem] rounded-full bg-accent/30 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 -left-24 size-[20rem] rounded-full bg-[oklch(0.879_0.169_91.605/0.25)] blur-3xl"
        />
        <p
          aria-hidden
          className="absolute -bottom-8 left-0 -z-0 w-full overflow-hidden text-center font-display text-[clamp(8rem,22vw,22rem)] leading-none tracking-[-0.05em] whitespace-nowrap text-primary-foreground/[0.07] select-none"
        >
          mpanera
        </p>
        <div className="relative max-w-2xl">
          <h2 className="font-display text-5xl leading-[0.95] sm:text-7xl">
            {ctas.isSignedIn ? (
              <>
                Reprenez là
                <br />
                <span className="text-accent italic">où vous étiez</span>.
              </>
            ) : (
              <>
                Prêt à trouver
                <br />
                <span className="text-accent italic">la bonne personne</span> ?
              </>
            )}
          </h2>
          <p className="mt-6 max-w-lg text-lg opacity-90">
            {ctas.isSignedIn
              ? "Votre espace est prêt, l'IA garde la mémoire de vos échanges."
              : "Pas besoin de chercher des heures. Demandez, l'IA s'occupe du reste."}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={ctas.primary.href}
              className="group inline-flex items-center gap-3 rounded-full bg-background px-7 py-4 text-base font-medium text-foreground shadow-xl transition hover:-translate-y-0.5"
            >
              {ctas.isSignedIn ? ctas.primary.label : "Commencer maintenant"}
              <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            {!ctas.isSignedIn && (
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 px-7 py-4 text-base font-medium hover:bg-primary-foreground/10"
              >
                Devenir prestataire
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 lg:flex-row lg:items-center lg:px-10">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center overflow-hidden rounded-lg bg-card ring-1 ring-border">
            <Image
              src="/logo.png"
              alt=""
              width={64}
              height={64}
              className="size-6 object-contain"
            />
          </span>
          <span className="font-display text-base">
            mpanera<span className="text-accent">.</span>ai
          </span>
          <span className="text-sm text-muted-foreground">
            · Madagascar, propulsé par l&apos;IA
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} mpanera. Misaotra betsaka.
        </p>
      </div>
    </footer>
  )
}

export { LandingPage }
