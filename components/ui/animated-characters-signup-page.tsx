"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSignUp } from "@clerk/nextjs/legacy"
import { isClerkAPIResponseError } from "@clerk/nextjs/errors"
import { AnimatedCharactersScene } from "@/components/auth/animated-characters-scene"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail } from "lucide-react"

type Role = "client" | "provider"
type Step = "form" | "verify"

function SignUpPage() {
  const router = useRouter()
  const { isLoaded, signUp, setActive } = useSignUp()

  const [step, setStep] = useState<Step>("form")
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<Role>("client")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      await signUp.create({
        emailAddress: email,
        password,
        unsafeMetadata: { role },
      })

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      })

      setStep("verify")
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        setError(err.errors[0]?.message ?? "Inscription impossible.")
      } else {
        setError("Une erreur est survenue. Réessayez dans un instant.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    setError("")
    setIsLoading(true)

    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code })

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId })
        router.push("/")
        return
      }

      setError("Code invalide ou expiré. Réessayez.")
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

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return
    setError("")
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sign-in/sso-callback",
        redirectUrlComplete: "/",
        unsafeMetadata: { role },
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
      {step === "form" ? (
        <SignUpForm
          email={email}
          password={password}
          confirmPassword={confirmPassword}
          role={role}
          showPassword={showPassword}
          isLoading={isLoading}
          isLoaded={isLoaded ?? false}
          error={error}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onRoleChange={setRole}
          onTogglePasswordVisible={() => setShowPassword((v) => !v)}
          onTypingChange={setIsTyping}
          onSubmit={handleSubmit}
          onGoogle={handleGoogleSignUp}
        />
      ) : (
        <VerifyEmailForm
          email={email}
          code={code}
          isLoading={isLoading}
          isLoaded={isLoaded ?? false}
          error={error}
          onCodeChange={setCode}
          onSubmit={handleVerify}
          onBack={() => setStep("form")}
        />
      )}
    </AuthShell>
  )
}

interface SignUpFormProps {
  email: string
  password: string
  confirmPassword: string
  role: Role
  showPassword: boolean
  isLoading: boolean
  isLoaded: boolean
  error: string
  onEmailChange: (v: string) => void
  onPasswordChange: (v: string) => void
  onConfirmPasswordChange: (v: string) => void
  onRoleChange: (v: Role) => void
  onTogglePasswordVisible: () => void
  onTypingChange: (v: boolean) => void
  onSubmit: (e: React.FormEvent) => void
  onGoogle: () => void
}

function SignUpForm({
  email,
  password,
  confirmPassword,
  role,
  showPassword,
  isLoading,
  isLoaded,
  error,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onRoleChange,
  onTogglePasswordVisible,
  onTypingChange,
  onSubmit,
  onGoogle,
}: SignUpFormProps) {
  return (
    <>
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          Bienvenue sur mpanera-ai
        </h1>
        <p className="text-sm text-muted-foreground">
          Créez votre compte en quelques secondes.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Je suis</Label>
          <div
            role="radiogroup"
            aria-label="Rôle"
            className="grid grid-cols-2 gap-3"
          >
            <RoleOption
              checked={role === "client"}
              onSelect={() => onRoleChange("client")}
              title="Client"
              description="Je cherche un prestataire"
            />
            <RoleOption
              checked={role === "provider"}
              onSelect={() => onRoleChange("provider")}
              title="Prestataire"
              description="Je propose mes services"
            />
          </div>
        </div>

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
              onChange={(e) => onPasswordChange(e.target.value)}
              required
              className="h-12 border-border/60 bg-background pr-10 focus:border-primary"
            />
            <button
              type="button"
              onClick={onTogglePasswordVisible}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
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

        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-sm font-medium">
            Confirmer le mot de passe
          </Label>
          <Input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            required
            className="h-12 border-border/60 bg-background focus:border-primary"
          />
        </div>

        {/* Clerk CAPTCHA mount point — required for bot protection */}
        <div id="clerk-captcha" />

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
          {isLoading ? "Création…" : "Créer mon compte"}
        </Button>
      </form>

      <div className="mt-6">
        <Button
          variant="outline"
          className="h-12 w-full border-border/60 bg-background hover:bg-accent"
          type="button"
          onClick={onGoogle}
          disabled={!isLoaded || isLoading}
        >
          <Mail className="mr-2 size-5" />
          Continuer avec Google
        </Button>
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-foreground hover:underline"
        >
          Se connecter
        </Link>
      </div>
    </>
  )
}

interface VerifyEmailFormProps {
  email: string
  code: string
  isLoading: boolean
  isLoaded: boolean
  error: string
  onCodeChange: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
}

function VerifyEmailForm({
  email,
  code,
  isLoading,
  isLoaded,
  error,
  onCodeChange,
  onSubmit,
  onBack,
}: VerifyEmailFormProps) {
  return (
    <>
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          Vérifiez votre email
        </h1>
        <p className="text-sm text-muted-foreground">
          Nous avons envoyé un code à{" "}
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
          {isLoading ? "Vérification…" : "Valider"}
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

interface RoleOptionProps {
  checked: boolean
  onSelect: () => void
  title: string
  description: string
}

function RoleOption({
  checked,
  onSelect,
  title,
  description,
}: RoleOptionProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={
        "flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-colors " +
        (checked
          ? "border-primary bg-primary/5"
          : "border-border/60 bg-background hover:border-border")
      }
    >
      <span className="text-sm font-medium text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </button>
  )
}

export const Component = SignUpPage
