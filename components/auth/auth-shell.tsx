import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

interface AuthShellProps {
  /** Contenu du panneau gauche (typiquement <AnimatedCharactersScene/>). */
  aside: ReactNode
  /** Contenu du panneau droit (formulaire). */
  children: ReactNode
}

function AuthShell({ aside, children }: AuthShellProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-12 text-primary-foreground lg:flex">
        <div className="relative z-20">
          <BrandLogo />
        </div>

        <div className="relative z-20 flex h-[500px] items-end justify-center">
          {aside}
        </div>

        <div className="bg-grid-white/[0.05] absolute inset-0 bg-[size:20px_20px]" />
        <div className="absolute top-1/4 right-1/4 size-64 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 size-96 rounded-full bg-primary-foreground/5 blur-3xl" />
      </div>

      <div className="flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-12 flex items-center justify-center lg:hidden">
            <BrandLogo />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

function BrandLogo() {
  return (
    <Link href="/" aria-label="mpanera-ai" className="inline-flex">
      <Image
        src="/logo.png"
        alt="mpanera-ai"
        width={48}
        height={48}
        priority
        className="size-12 rounded-lg object-contain"
      />
    </Link>
  )
}

export { AuthShell }
