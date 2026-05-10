import Link from "next/link"

export default function ConversationPlaceholderPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center gap-5 px-6 py-24 text-center">
      <p className="font-display text-4xl leading-tight sm:text-5xl">
        Conversation démarrée ✨
      </p>
      <p className="max-w-md font-serif text-lg text-muted-foreground italic">
        Misaotra. La messagerie complète arrive bientôt.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex items-center rounded-full border border-border px-7 py-3 text-base font-medium transition hover:bg-card"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  )
}
