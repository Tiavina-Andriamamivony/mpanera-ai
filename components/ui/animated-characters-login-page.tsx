"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSignIn } from "@clerk/nextjs/legacy"
import { isClerkAPIResponseError } from "@clerk/nextjs/errors"
import { AnimatedCharactersScene } from "@/components/auth/animated-characters-scene"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail } from "lucide-react"

function LoginPage() {
  const router = useRouter()
  const { isLoaded, signIn, setActive } = useSignIn()

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    setError("")
    setIsLoading(true)

    try {
      const attempt = await signIn.create({
        identifier: email,
        password,
      })

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId })
        router.push("/")
        return
      }

      setError(
        "Connexion incomplète. Vérifiez si une étape supplémentaire est requise."
      )
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        setError(err.errors[0]?.message ?? "Identifiants invalides.")
      } else {
        setError("Une erreur est survenue. Réessayez dans un instant.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return
    setError("")
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sign-in/sso-callback",
        redirectUrlComplete: "/",
      })
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        setError(err.errors[0]?.message ?? "Connexion Google impossible.")
      } else {
        setError("Connexion Google impossible. Réessayez.")
      }
    }
  }

  return (
    <AuthShell
      aside={
        <AnimatedCharactersScene
          isTyping={isTyping}
          hasPassword={password.length > 0}
          passwordVisible={showPassword}
        />
      }
    >
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Bon retour !</h1>
        <p className="text-sm text-muted-foreground">
          Connectez-vous pour retrouver vos prestataires.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="anna@gmail.com"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
            required
            className="h-12 border-border/60 bg-background focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Mot de passe
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 border-border/60 bg-background pr-10 focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
            >
              {showPassword ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" />
            <Label
              htmlFor="remember"
              className="cursor-pointer text-sm font-normal"
            >
              Rester connecté 30 jours
            </Label>
          </div>
          <Link
            href="/sign-in/forgot-password"
            className="text-sm font-medium text-primary hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        {error && (
          <div className="rounded-lg border border-red-900/30 bg-red-950/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="h-12 w-full text-base font-medium"
          size="lg"
          disabled={isLoading || !isLoaded}
        >
          {isLoading ? "Connexion…" : "Se connecter"}
        </Button>
      </form>

      <div className="mt-6">
        <Button
          variant="outline"
          className="h-12 w-full border-border/60 bg-background hover:bg-accent"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={!isLoaded || isLoading}
        >
          <Mail className="mr-2 size-5" />
          Continuer avec Google
        </Button>
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-foreground hover:underline"
        >
          Créer un compte
        </Link>
      </div>
    </AuthShell>
  )
}

export const Component = LoginPage
