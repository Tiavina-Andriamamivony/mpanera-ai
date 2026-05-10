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
import { Eye, EyeOff } from "lucide-react"

type Step = "request" | "reset"

function ForgotPasswordPage() {
  const router = useRouter()
  const { isLoaded, signIn, setActive } = useSignIn()

  const [step, setStep] = useState<Step>("request")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    setError("")
    setIsLoading(true)

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      })

      setStep("reset")
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        setError(err.errors[0]?.message ?? "Email introuvable.")
      } else {
        setError("Une erreur est survenue. Réessayez dans un instant.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    setError("")
    setIsLoading(true)

    try {
      const attempt = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: newPassword,
      })

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId })
        router.push("/")
        return
      }

      setError("Réinitialisation incomplète. Réessayez.")
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        setError(err.errors[0]?.message ?? "Code invalide.")
      } else {
        setError("Une erreur est survenue. Réessayez dans un instant.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell
      aside={
        <AnimatedCharactersScene
          isTyping={isTyping}
          hasPassword={newPassword.length > 0}
          passwordVisible={showPassword}
        />
      }
    >
      {step === "request" ? (
        <RequestForm
          email={email}
          isLoading={isLoading}
          isLoaded={isLoaded ?? false}
          error={error}
          onEmailChange={setEmail}
          onTypingChange={setIsTyping}
          onSubmit={handleRequest}
        />
      ) : (
        <ResetForm
          email={email}
          code={code}
          newPassword={newPassword}
          showPassword={showPassword}
          isLoading={isLoading}
          isLoaded={isLoaded ?? false}
          error={error}
          onCodeChange={setCode}
          onPasswordChange={setNewPassword}
          onTogglePasswordVisible={() => setShowPassword((v) => !v)}
          onSubmit={handleReset}
          onBack={() => setStep("request")}
        />
      )}
    </AuthShell>
  )
}

interface RequestFormProps {
  email: string
  isLoading: boolean
  isLoaded: boolean
  error: string
  onEmailChange: (v: string) => void
  onTypingChange: (v: boolean) => void
  onSubmit: (e: React.FormEvent) => void
}

function RequestForm({
  email,
  isLoading,
  isLoaded,
  error,
  onEmailChange,
  onTypingChange,
  onSubmit,
}: RequestFormProps) {
  return (
    <>
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          Mot de passe oublié ?
        </h1>
        <p className="text-sm text-muted-foreground">
          Entrez votre email, nous vous enverrons un code pour le
          réinitialiser.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
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
            onChange={(e) => onEmailChange(e.target.value)}
            onFocus={() => onTypingChange(true)}
            onBlur={() => onTypingChange(false)}
            required
            className="h-12 border-border/60 bg-background focus:border-primary"
          />
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
          {isLoading ? "Envoi…" : "Envoyer le code"}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <Link
          href="/sign-in"
          className="font-medium text-foreground hover:underline"
        >
          Retour à la connexion
        </Link>
      </div>
    </>
  )
}

interface ResetFormProps {
  email: string
  code: string
  newPassword: string
  showPassword: boolean
  isLoading: boolean
  isLoaded: boolean
  error: string
  onCodeChange: (v: string) => void
  onPasswordChange: (v: string) => void
  onTogglePasswordVisible: () => void
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
}

function ResetForm({
  email,
  code,
  newPassword,
  showPassword,
  isLoading,
  isLoaded,
  error,
  onCodeChange,
  onPasswordChange,
  onTogglePasswordVisible,
  onSubmit,
  onBack,
}: ResetFormProps) {
  return (
    <>
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          Choisissez un nouveau mot de passe
        </h1>
        <p className="text-sm text-muted-foreground">
          Entrez le code reçu sur{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="code" className="text-sm font-medium">
            Code de vérification
          </Label>
          <Input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            required
            className="h-12 border-border/60 bg-background tracking-widest focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-password" className="text-sm font-medium">
            Nouveau mot de passe
          </Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
              className="h-12 border-border/60 bg-background pr-10 focus:border-primary"
            />
            <button
              type="button"
              onClick={onTogglePasswordVisible}
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
          {isLoading ? "Réinitialisation…" : "Réinitialiser le mot de passe"}
        </Button>
      </form>

      <button
        type="button"
        className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground"
        onClick={onBack}
      >
        Modifier mon adresse email
      </button>
    </>
  )
}

export const Component = ForgotPasswordPage
