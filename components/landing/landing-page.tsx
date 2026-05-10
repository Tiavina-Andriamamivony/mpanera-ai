"use client"

import Link from "next/link"
import { ArrowUpRight, Sparkles, ShieldCheck, MessageCircle } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { Preloader } from "@/components/landing/preloader"
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
      label: role === "provider" ? "Voir mes demandes" : "Reprendre ma recherche",
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
        <Trust />
        <FinalCta />
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
    <section className="relative mx-auto grid min-h-[92vh] max-w-7xl grid-cols-1 items-end gap-12 px-6 pt-24 pb-20 lg:grid-cols-12 lg:px-10">
      <div className="lg:col-span-8">
        <p className="reveal mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium tracking-wide uppercase backdrop-blur">
          <span className="size-1.5 rounded-full bg-accent" />
          Madagascar — propulsé par l&apos;IA
        </p>

        <h1 className="reveal font-display text-[clamp(3.5rem,11vw,9.5rem)] leading-[0.88] tracking-[-0.04em]">
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

      <aside className="reveal lg:col-span-4">
        <div className="relative isolate ml-auto w-full max-w-sm">
          <div className="absolute -top-6 -right-4 z-20 rotate-[6deg] rounded-2xl bg-accent px-4 py-2 font-display text-sm text-accent-foreground shadow-xl">
            Salama ô !
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-2xl shadow-primary/5">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </div>
              <div className="text-sm">
                <p className="font-medium">mpanera</p>
                <p className="text-muted-foreground">en ligne</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <Bubble role="ai">
                Bonjour, dites-moi ce que vous cherchez. Un service, une
                personne, une réparation ?
              </Bubble>
              <Bubble role="user">
                Mon robinet fuit dans la cuisine, à Ambohibao.
              </Bubble>
              <Bubble role="ai" pending>
                Je cherche les plombiers disponibles près de chez vous…
              </Bubble>
            </div>
          </div>
        </div>
      </aside>
    </section>
  )
}

function Bubble({
  role,
  pending,
  children,
}: {
  role: "ai" | "user"
  pending?: boolean
  children: React.ReactNode
}) {
  if (role === "user") {
    return (
      <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-primary-foreground">
        {children}
      </div>
    )
  }
  return (
    <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-secondary px-4 py-2.5 text-secondary-foreground">
      {children}
      {pending && (
        <span className="ml-1 inline-flex gap-0.5 align-middle">
          <Dot delay="0s" />
          <Dot delay="0.15s" />
          <Dot delay="0.3s" />
        </span>
      )}
    </div>
  )
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="inline-block size-1 animate-bounce rounded-full bg-current opacity-60"
      style={{ animationDelay: delay }}
    />
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
          <span className="italic text-primary">zéro complication.</span>
        </h2>
        <p className="hidden max-w-xs text-muted-foreground sm:block">
          Conçu pour tout le monde, pas seulement pour ceux qui sont à l&apos;aise
          avec le digital.
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
        <div className="relative max-w-2xl">
          <h2 className="font-display text-5xl leading-[0.95] sm:text-7xl">
            {ctas.isSignedIn ? (
              <>
                Reprenez là
                <br />
                <span className="italic text-accent">où vous étiez</span>.
              </>
            ) : (
              <>
                Prêt à trouver
                <br />
                <span className="italic text-accent">la bonne personne</span> ?
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

export { LandingPage }
