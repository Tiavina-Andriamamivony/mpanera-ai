type ClientDetailsPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function ClientDetailsPage({ params }: ClientDetailsPageProps) {
  const { id } = await params

  return (
    <section className="space-y-3">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Client
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">{id}</h1>
      <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
        Détail d&apos;un client sur la route <code>/app/clients/{id}</code>.
      </p>
    </section>
  )
}
