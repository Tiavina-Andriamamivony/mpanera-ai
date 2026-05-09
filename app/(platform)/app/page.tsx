export default function AppHomePage() {
  return (
    <section className="space-y-3">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">App</p>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Dashboard</h1>
      <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
        Page racine de l&apos;application sous <code>/app</code>. Utilise cette zone pour ton
        shell authentifié, navigation interne et vues métier.
      </p>
    </section>
  )
}
