import type { UserRole } from "@prisma/client"

export type ClerkPublicMetadata = {
  role?: UserRole
  onBoardingComplete?: boolean
}

export function readClerkMeta(
  raw: unknown
): ClerkPublicMetadata | undefined {
  if (!raw || typeof raw !== "object") return undefined
  const meta = raw as Record<string, unknown>
  const role =
    meta.role === "CLIENT" || meta.role === "PROVIDER"
      ? (meta.role as UserRole)
      : undefined
  const onBoardingComplete =
    typeof meta.onBoardingComplete === "boolean"
      ? meta.onBoardingComplete
      : undefined
  return { role, onBoardingComplete }
}
