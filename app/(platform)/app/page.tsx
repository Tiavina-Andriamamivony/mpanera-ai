export default function AppHomePage() {
  return (
    <section className="space-y-3">
      <p className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
        Application
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Tableau de bord
      </h1>
      <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
        Vue d&apos;ensemble de l&apos;espace connecté sous{" "}
        <code className="rounded bg-muted px-1.5 py-0.5">/app</code>. Utilisez
        cette zone pour la navigation interne et les vues métier (parcours
        client et prestataire).
      </p>
    </section>
  )
}
