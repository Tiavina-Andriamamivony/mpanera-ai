import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-svh bg-background">
      <section className="mx-auto flex min-h-svh w-full max-w-6xl flex-col justify-center gap-8 px-6 py-16">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Mpanera AI
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Landing page
          </h1>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Point d&apos;entrée public de l&apos;application. Cette page peut ensuite accueillir le
            hero, les sections produit et les CTA.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/app"
            className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
          >
            Ouvrir l&apos;application
          </Link>
          <Link
            href="/app/providers/demo-provider"
            className="inline-flex h-11 items-center rounded-full border border-border px-5 text-sm font-medium text-foreground"
          >
            Voir un provider
          </Link>
        </div>
      </section>
    </main>
  )
}
