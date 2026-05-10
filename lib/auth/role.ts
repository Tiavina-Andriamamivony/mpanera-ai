import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import type { UserRole } from "@prisma/client"
import { db } from "@/lib/db"
import { readClerkMeta } from "@/lib/auth/clerk-meta"

export async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null
  return db.user.findUnique({ where: { clerkId: userId } })
}

export async function requireRole(role: UserRole) {
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect("/sign-in")
  const meta = readClerkMeta(sessionClaims?.publicMetadata)
  if (!meta?.onBoardingComplete) redirect("/onboarding")
  if (meta.role !== role) {
    redirect(role === "CLIENT" ? "/provider/discussion" : "/client/discussion")
  }
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { provider: true },
  })
  if (!user) redirect("/onboarding")
  return user
}

export async function getCurrentClerkUser() {
  return currentUser()
}
