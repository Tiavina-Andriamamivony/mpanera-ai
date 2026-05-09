import Link from 'next/link'

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-svh bg-muted/30">
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-6">
          <Link href="/" className="text-sm font-semibold text-foreground">
            Mpanera AI
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/app">Dashboard</Link>
            <Link href="/app/providers/demo-provider">Provider</Link>
            <Link href="/app/clients/demo-client">Client</Link>
          </nav>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
    </div>
  )
}
