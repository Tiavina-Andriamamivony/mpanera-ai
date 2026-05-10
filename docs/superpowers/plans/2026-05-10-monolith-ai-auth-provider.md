# Monolithe Prisma — IA, auth, parcours prestataire — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Brancher un backend monolithe Next.js + Prisma SQLite sous le front existant : IA NVIDIA dé-hardcodée derrière `/api/ai/chat` SSE, onboarding + role-guard Clerk, parcours prestataire end-to-end (annonce, accept/refuse, formulaire dynamique, confirmation, redirect messagerie).

**Architecture:** Phase 1 séquentielle (fondations Prisma + lib/ai + helpers auth + sortie clé en env), puis Phase 2 fan-out 3 subagents en parallèle sur périmètres fichiers exclusifs (A: IA & API métier, B: parcours prestataire, C: auth/onboarding/guard), puis Phase 3 intégration + smoke test. Aucun fichier partagé entre subagents. DIP via `AiClient` interface, SRP entre orchestrator/route/persistance.

**Tech Stack:** Next.js 16 App Router, React 19, Prisma 5 + SQLite, Clerk v7 (`proxy.ts`), NVIDIA NIM API (`moonshotai/kimi-k2.6`, SSE streaming), TypeScript strict, pnpm, Tailwind v4, framer-motion (déjà présent).

**Spec source:** `docs/superpowers/specs/2026-05-10-monolith-ai-auth-provider-design.md`.

**Convention narration (CLAUDE.md):** chaque task/PR = court "Did / Worked / Blocked" dans le commit body ou la sortie agent.

**Convention prettier:** pas de point-virgule, double quotes, 2-space, `printWidth: 80`. `pnpm format` plutôt que match manuel.

---

## Phase 1 — Fondations (séquentiel, main session)

### Task 1: Installer Prisma + tsx et initialiser SQLite

**Files:**
- Modify: `package.json` (deps + scripts)
- Create: `prisma/schema.prisma` (généré par `prisma init`, écrasé Task 2)
- Modify: `.gitignore` (ajout `dev.db`, `dev.db-journal`)

- [ ] **Step 1: Installer les dépendances**

Run:
```bash
pnpm add prisma @prisma/client
pnpm add -D tsx
```

Expected: deps ajoutées, lockfile à jour. Pas d'erreur peer-deps.

- [ ] **Step 2: Initialiser Prisma SQLite**

Run:
```bash
pnpm prisma init --datasource-provider sqlite
```

Expected: crée `prisma/schema.prisma` (sera écrasé Task 2) et écrit `DATABASE_URL="file:./dev.db"` dans `.env`. Si `.env` existe déjà, vérifier que la ligne est ajoutée et pas dupliquée.

- [ ] **Step 3: Ajouter scripts pnpm**

Modify `package.json` `"scripts"` :
```json
"db:migrate": "prisma migrate dev",
"db:seed": "tsx prisma/seed.ts",
"db:studio": "prisma studio",
"postinstall": "prisma generate"
```

Et ajouter dans `package.json` au top-level :
```json
"prisma": { "seed": "tsx prisma/seed.ts" }
```

- [ ] **Step 4: Mettre à jour `.gitignore`**

Append:
```
# Prisma local DB
prisma/dev.db
prisma/dev.db-journal
prisma/migrations/migration_lock.toml
!prisma/migrations/migration_lock.toml
```

(La dernière ligne réautorise le lock, qu'il faut commit. Vérifier qu'on n'ignore pas tout le dossier migrations.)

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml prisma/ .gitignore .env.example 2>/dev/null
git commit -m "chore(prisma): install Prisma + tsx, init SQLite datasource

Did: pnpm add prisma @prisma/client + tsx, prisma init sqlite, scripts pnpm.
Worked: schema vide généré, .env porteur de DATABASE_URL.
Blocked: rien.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Écrire le schéma Prisma canonique + migration initiale

**Files:**
- Modify: `prisma/schema.prisma` (écrase la version `prisma init`)
- Create: `prisma/migrations/<timestamp>_init/migration.sql` (généré)

- [ ] **Step 1: Écrire `prisma/schema.prisma`**

Contenu complet (écraser le fichier) :
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

enum UserRole {
  CLIENT
  PROVIDER
}

enum RequestStatus {
  PENDING
  ACCEPTED
  REFUSED
  CANCELLED
  CONFIRMED
}

model User {
  id                 String   @id @default(cuid())
  clerkId            String   @unique
  email              String   @unique
  firstName          String?
  lastName           String?
  role               UserRole
  district           String?
  city               String?
  onBoardingComplete Boolean  @default(false)
  createdAt          DateTime @default(now())

  provider       Provider?
  aiMessages     AiMessage[]
  clientRequests ServiceRequest[] @relation("ClientRequests")
}

model Provider {
  id                 String   @id @default(cuid())
  userId             String   @unique
  user               User     @relation(fields: [userId], references: [id])
  bio                String?
  averageRating      Float    @default(0)
  completedJobsCount Int      @default(0)
  verified           Boolean  @default(false)
  categoryId         String
  category           Category @relation(fields: [categoryId], references: [id])
  requests           ServiceRequest[] @relation("ProviderRequests")
}

model Category {
  id        String     @id @default(cuid())
  name      String     @unique
  slug      String     @unique
  icon      String?
  providers Provider[]
}

model AiMessage {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  sessionId  String
  turn       Int
  message    String
  aiResponse String
  meta       String?  // JSON sérialisé (SQLite n'a pas de Json natif)
  createdAt  DateTime @default(now())

  @@index([userId, sessionId])
}

model ServiceRequest {
  id                String        @id @default(cuid())
  clientId          String
  client            User          @relation("ClientRequests", fields: [clientId], references: [id])
  providerId        String
  provider          Provider      @relation("ProviderRequests", fields: [providerId], references: [id])
  categoryId        String
  description       String
  status            RequestStatus @default(PENDING)
  providerNotes     String?
  priceMin          Int?
  priceMax          Int?
  clientFormAnswers String?       // JSON sérialisé
  freeTextSpec      String?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  @@index([clientId, status])
  @@index([providerId, status])
}
```

Note SQLite : pas de type `Json` natif → `meta` et `clientFormAnswers` stockés en `String` (JSON sérialisé). Les helpers de lecture/écriture sont dans `lib/db.ts` (Task 4).

- [ ] **Step 2: Générer la migration et le client**

Run:
```bash
pnpm prisma migrate dev --name init
```

Expected: crée `prisma/migrations/<timestamp>_init/migration.sql`, applique sur `prisma/dev.db`, regénère `node_modules/.prisma/client`. Output contient `Database is now in sync with your schema`.

- [ ] **Step 3: Vérifier le client typé**

Run:
```bash
pnpm typecheck
```

Expected: PASS (le client Prisma est généré et reconnu).

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(db): schéma Prisma initial (User, Provider, Category, AiMessage, ServiceRequest)

Did: schéma 5 modèles + 2 enums + index, migration init appliquée.
Worked: client Prisma généré, typecheck clean.
Blocked: rien (SQLite — Json sérialisé en String, prévu).

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Seed catégories

**Files:**
- Create: `prisma/seed.ts`

- [ ] **Step 1: Écrire `prisma/seed.ts`**

```ts
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const categories = [
  { name: "Plomberie", slug: "plomberie", icon: "Wrench" },
  { name: "Électricité", slug: "electricite", icon: "Zap" },
  { name: "Couture", slug: "couture", icon: "Scissors" },
  { name: "Ménage", slug: "menage", icon: "SprayCan" },
  { name: "Cours particuliers", slug: "cours-particuliers", icon: "GraduationCap" },
  { name: "Traiteur", slug: "traiteur", icon: "ChefHat" },
]

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon },
      create: c,
    })
  }
  console.log(`Seeded ${categories.length} categories`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

- [ ] **Step 2: Exécuter le seed**

Run:
```bash
pnpm db:seed
```

Expected: `Seeded 6 categories`. Re-run idempotent (upsert).

- [ ] **Step 3: Vérifier en DB**

Run:
```bash
pnpm prisma studio
```

(Ne pas bloquer la session ; ouvrir, vérifier table `Category`, fermer.) Ou simplement :
```bash
pnpm tsx -e "import('@prisma/client').then(({PrismaClient}) => new PrismaClient().category.findMany().then(console.log))"
```

Expected: 6 lignes affichées.

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat(db): seed 6 catégories de service

Did: seed idempotent via upsert sur slug, icônes lucide nommées.
Worked: db:seed pose 6 catégories, runs idempotents.
Blocked: rien.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Singleton Prisma + helpers auth

**Files:**
- Create: `lib/db.ts`
- Create: `lib/auth/role.ts`
- Create: `lib/auth/clerk-meta.ts`

- [ ] **Step 1: Écrire `lib/db.ts`**

```ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db

export function parseJsonField<T>(raw: string | null | undefined): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function stringifyJsonField(value: unknown): string {
  return JSON.stringify(value)
}
```

- [ ] **Step 2: Écrire `lib/auth/clerk-meta.ts`**

```ts
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
```

- [ ] **Step 3: Écrire `lib/auth/role.ts`**

```ts
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
  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user) redirect("/onboarding")
  return user
}

export async function getCurrentClerkUser() {
  return currentUser()
}
```

- [ ] **Step 4: Vérifier la compilation**

Run:
```bash
pnpm typecheck
```

Expected: PASS. Si erreur sur `@clerk/nextjs/server` import `currentUser`, vérifier la version Clerk dans `package.json` (v7+).

- [ ] **Step 5: Commit**

```bash
git add lib/db.ts lib/auth/
git commit -m "feat(lib): singleton Prisma HMR-safe + helpers auth Clerk

Did: db.ts singleton, parseJson/stringifyJson helpers (SQLite), readClerkMeta typé,
     getCurrentUser + requireRole avec redirect par rôle.
Worked: typecheck clean, DIP via re-export depuis @/lib/auth/role.
Blocked: rien.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Sortir la clé NVIDIA hardcodée vers `.env`

**Files:**
- Modify: `ai/index.ts:7-11` (HEADERS)
- Create/Modify: `.env` (ajout `NVIDIA_API_KEY`)
- Create: `.env.example`

- [ ] **Step 1: Lire la clé actuelle**

Lire `ai/index.ts` ligne 8 : `Authorization: Bearer nvapi-oA1J1a0hG-...`. Copier cette valeur (la clé en clair) — elle ira dans `.env` local.

- [ ] **Step 2: Ajouter à `.env`**

Append à `.env` (créé par `prisma init`) :
```
NVIDIA_API_KEY=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
```

(Vérifier que `.env` est bien dans `.gitignore`. Si déjà tracké pour Clerk test keys — voir CLAUDE.md §Secrets — c'est connu et accepté.)

- [ ] **Step 3: Créer `.env.example`**

```
# Clerk (test keys partagées en dev — voir CLAUDE.md)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Prisma SQLite local
DATABASE_URL=file:./dev.db

# NVIDIA NIM API (LLM principal)
NVIDIA_API_KEY=
```

- [ ] **Step 4: Modifier `ai/index.ts` pour lire depuis env**

Remplacer le bloc `HEADERS` (lignes 7-11) :
```ts
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY
if (!NVIDIA_API_KEY) {
  console.error("NVIDIA_API_KEY manquante dans l'environnement")
  process.exit(1)
}

const HEADERS = {
  Authorization: `Bearer ${NVIDIA_API_KEY}`,
  "Content-Type": "application/json",
  Accept: "text/event-stream",
}
```

(Note : ce fichier sera complètement refactoré par le subagent A en Phase 2 ; ici on enlève juste la clé en clair.)

- [ ] **Step 5: Commit**

```bash
git add .env.example ai/index.ts
git commit -m "chore(secrets): sortir la clé NVIDIA de ai/index.ts vers env

Did: NVIDIA_API_KEY lue depuis process.env, .env.example créé.
Worked: ai/index.ts ne contient plus la clé en clair.
Blocked: la clé reste dans l'historique git — à rotater côté NVIDIA après la session.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

⚠️ **Note utilisateur** : la clé est encore dans l'historique git (commit `78aa583`). Rotater côté NVIDIA dashboard après la session.

---

## Phase 2 — Fan-out subagents (parallèle, 1 message, 3 Agent calls)

À ce stade, Phase 1 est commit. Les 3 subagents reçoivent en brief : (a) cette spec, (b) ce plan, (c) leur périmètre exclusif, (d) interdiction de toucher au schéma Prisma + à `lib/db.ts` + à `lib/auth/*`, (e) consigne narration "Did/Worked/Blocked", (f) prettier sans semi.

### Task 6 — Agent A : IA & API métier (subagent_type: senior-polyglot-developer)

**Périmètre exclusif :**
- Create: `lib/ai/nvidia-client.ts`
- Create: `lib/ai/prompts.ts`
- Create: `lib/ai/orchestrator.ts`
- Create: `lib/ai/dynamic-form.ts`
- Create: `app/api/ai/chat/route.ts`
- Create: `app/api/categories/route.ts`
- Create: `app/api/providers/[categoryId]/route.ts`
- Modify: `ai/index.ts` (refactor en thin CLI consommant `lib/ai/orchestrator.ts`)

**Brief à coller à l'agent :**

```
Tu refactores l'IA actuelle (ai/index.ts) en module serveur consommé par une route Next.js streaming SSE.

LECTURE OBLIGATOIRE :
- /home/yuta/mpanera-ai/mpanera-ai/CLAUDE.md (KISS/SRP/DIP, prettier sans semi, "Did/Worked/Blocked")
- /home/yuta/mpanera-ai/mpanera-ai/ai/GEMINI.md (contexte 3-turn loop, MPANERA_META, contexte Madagascar)
- /home/yuta/mpanera-ai/mpanera-ai/docs/superpowers/specs/2026-05-10-monolith-ai-auth-provider-design.md (§3, §5.2)
- /home/yuta/mpanera-ai/mpanera-ai/ai/index.ts (logique source à extraire)
- /home/yuta/mpanera-ai/mpanera-ai/prisma/schema.prisma (figé, ne pas modifier)

INTERDICTIONS :
- Ne pas modifier prisma/schema.prisma, lib/db.ts, lib/auth/*.
- Ne pas toucher à proxy.ts, app/layout.tsx, app/onboarding/*, app/provider/*, app/client/*.
- Pas de point-virgule, double quotes, 2-space (prettier).

LIVRABLES :

1. lib/ai/nvidia-client.ts — Interface AiClient + impl NVIDIA :
   - export interface AiClient { stream(messages, opts): AsyncGenerator<string> }
   - export function createNvidiaClient(): AiClient lit process.env.NVIDIA_API_KEY,
     POST https://integrate.api.nvidia.com/v1/chat/completions stream:true,
     yield les deltas (logique extraite de callIA dans ai/index.ts).
   - Throw si NVIDIA_API_KEY absente.

2. lib/ai/prompts.ts — Constantes :
   - SYSTEM_BASE (extrait depuis ai/index.ts ligne 22-23, intact)
   - turn1Instruction(categories: {id, slug, name}[]): string
   - turn2Instruction(): string
   - turn3Instruction(providers: ProviderForPrompt[]): string
   - export type ProviderForPrompt = { name, district, rating, phone?, priceMin?, priceMax? }

3. lib/ai/orchestrator.ts — Logique pure (sans HTTP/DB) :
   - export type OrchestratorInput = { turn: 1|2|3, userMessage, history: Message[],
                                        categories?, providers? }
   - export type OrchestratorOutput = { stream: AsyncGenerator<string>,
                                        finalize: () => Promise<{ aiText, meta }> }
   - export async function runOrchestrator(input, client: AiClient): Promise<OrchestratorOutput>
   - Reproduit extractMeta + stripMeta depuis ai/index.ts (le format MPANERA_META:{"categorie":"X","quartier":"Y"}).
   - turn=1 → instruction injecte categories[].slug ; on attend MPANERA_META.
   - turn=2 → instruction simple.
   - turn=3 → instruction injecte providers (formattés).

4. lib/ai/dynamic-form.ts — Questions formulaire par catégorie (MVP, pas IA) :
   - export type DynamicFormQuestion = { key, label, type: "text"|"number"|"date"|"select",
                                          options?, required }
   - export function getQuestionsForCategory(slug: string): DynamicFormQuestion[]
   - Couverture des 6 catégories seedées avec 3-5 questions chacune.
   - Toujours un champ "freeTextSpec" libre dans la fiche client (textarea, label "Précisions
     supplémentaires (spé ohatra)") — géré côté UI subagent B, pas par cette fonction.

5. app/api/ai/chat/route.ts — POST stream SSE :
   - export const runtime = "nodejs"
   - Body: { message: string, sessionId?: string, turn?: 1|2|3 }
   - requireRole("CLIENT") (depuis lib/auth/role.ts).
   - Si pas de sessionId fourni : crypto.randomUUID().
   - Récupère history depuis db.aiMessage findMany sur (userId, sessionId), order by turn.
   - Si turn=1 : db.category.findMany() pour la liste.
   - Si turn=3 : récupérer la categorieId depuis le AiMessage de turn=1 (champ meta JSON), puis
     db.provider.findMany({ where: { categoryId }, take: 5, include: { user: true } }) →
     mapper en ProviderForPrompt.
   - runOrchestrator(...) → ReadableStream qui yield "data: {\"delta\":\"...\"}\n\n" puis
     "data: {\"event\":\"end\",\"sessionId\":\"...\",\"turn\":N,\"providers\":[...]?}\n\n".
   - Au finalize : db.aiMessage.create avec stringifyJsonField(meta).

6. app/api/categories/route.ts — GET, public :
   - return db.category.findMany({ orderBy: { name: "asc" } }).

7. app/api/providers/[categoryId]/route.ts — GET, public, top-N :
   - Params: categoryId.
   - return db.provider.findMany({ where: { categoryId }, take: 5,
       orderBy: [{ averageRating: "desc" }, { completedJobsCount: "desc" }],
       include: { user: { select: { firstName, lastName, district, city } } } })

8. ai/index.ts (refactor) — thin CLI :
   - Garde l'invocation `node ai/index.ts "message" '<sessionJson>'`.
   - import createNvidiaClient + runOrchestrator depuis ../lib/ai/.
   - Stub léger pour les fetch categories/providers : si pas de DB Prisma accessible
     en mode CLI standalone (Prisma marche très bien hors Next), connecte db depuis
     lib/db.ts. Sinon liste vide.
   - Conserve la sortie MPANERA_SESSION pour compat.

VÉRIFICATION :
- pnpm typecheck doit passer.
- pnpm lint doit passer.
- curl manuel sur /api/ai/chat impossible sans Clerk session ; au moins valider le typage
  avec un test inline tsx d'un orchestrator avec un AiClient fake (générateur qui yield
  "Bonjour MPANERA_META:{\"categorie\":\"plomberie\",\"quartier\":\"Antananarivo\"}") et
  vérifier extraction meta + stripMeta correctes.
- ai/index.ts reste exécutable : node --import tsx ai/index.ts "robinet fuit" — log un message
  texte sans crash secret.

NARRATION : termine ton output par un bloc :
Did: …
Worked: …
Blocked: …
```

- [ ] **Step 1: Lancer l'agent**

Lancer en parallèle (avec B et C) via un seul message Agent× 3.

- [ ] **Step 2: Réviser le diff**

Lire les fichiers créés/modifiés. Vérifier : DIP respecté (route ne crée pas le NvidiaClient en dur), pas de `console.log` parasite, pas de TODO sans owner, prettier OK.

- [ ] **Step 3: typecheck + lint**

```bash
pnpm typecheck
pnpm lint
```

Expected: PASS. Sinon corriger inline avant de passer à Phase 3.

- [ ] **Step 4: Commit**

```bash
git add lib/ai/ app/api/ai/ app/api/categories/ app/api/providers/ ai/index.ts
git commit -m "feat(ai): orchestrator extrait + route /api/ai/chat SSE + endpoints catégories/providers

Did: lib/ai/{nvidia-client,prompts,orchestrator,dynamic-form}, route SSE streaming,
     persistance AiMessage, ai/index.ts refactor en thin CLI.
Worked: typecheck/lint OK, fake AiClient unit-style validé extractMeta.
Blocked: clé NVIDIA toujours dans l'historique (à rotater).

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 7 — Agent B : Parcours prestataire & demandes (subagent_type: senior-polyglot-developer)

**Périmètre exclusif :**
- Modify: `app/provider/discussion/page.tsx` (existant, à brancher)
- Modify: `app/provider/messages/[conversationId]/page.tsx` (existant, à brancher)
- Modify: `app/client/discussion/results/page.tsx` (existant, refus poli + alternatives)
- Create: `app/api/requests/route.ts`
- Create: `app/api/requests/[id]/respond/route.ts`
- Create: `app/api/requests/[id]/client-answers/route.ts`
- Create: `app/api/requests/[id]/confirm/route.ts`

**Brief à coller à l'agent :**

```
Tu implémentes le parcours prestataire end-to-end + le suivi de demandes côté client.

LECTURE OBLIGATOIRE :
- /home/yuta/mpanera-ai/mpanera-ai/CLAUDE.md
- /home/yuta/mpanera-ai/mpanera-ai/USER_ROADMAP.md (§2 entier — annonce IA, accept/refuse,
  formulaire dynamique, textarea "spé ohatra", refus poli §2.3)
- /home/yuta/mpanera-ai/mpanera-ai/docs/superpowers/specs/2026-05-10-monolith-ai-auth-provider-design.md (§5.3-5.7)
- /home/yuta/mpanera-ai/mpanera-ai/prisma/schema.prisma (figé)
- /home/yuta/mpanera-ai/mpanera-ai/app/provider/discussion/page.tsx (existant)
- /home/yuta/mpanera-ai/mpanera-ai/app/provider/messages/[conversationId]/page.tsx (existant)
- /home/yuta/mpanera-ai/mpanera-ai/app/client/discussion/results/page.tsx (existant)
- /home/yuta/mpanera-ai/mpanera-ai/components/ui/interactive-broker-card.tsx (réutilisable lecture)

INTERDICTIONS :
- Ne pas modifier prisma/schema.prisma, lib/db.ts, lib/auth/*, lib/ai/*.
- Ne pas toucher à proxy.ts, app/layout.tsx, app/onboarding/*, app/api/ai/*, app/api/categories/*,
  app/api/providers/*.
- Pas de mock SSE / fake IA — la liste de demandes vient du DB Prisma directement.

LIVRABLES :

1. app/api/requests/route.ts — POST batch création (CLIENT) :
   - requireRole("CLIENT")
   - Body { categoryId: string, description: string, providerIds: string[] }
   - Valider providerIds non vide, providers existent dans la catégorie.
   - prisma.serviceRequest.createMany(data: providerIds.map(pid => ({clientId: user.id,
                                                                       providerId: pid,
                                                                       categoryId, description})))
   - return { ids } (NextResponse.json, 201)

2. app/api/requests/[id]/respond/route.ts — POST accept|refuse (PROVIDER) :
   - requireRole("PROVIDER")
   - Body discriminé : { action: "refuse" } | { action: "accept", notes?, priceMin?, priceMax? }
   - Vérif: request existe, request.providerId === user.provider.id, status === PENDING.
   - refuse → status=REFUSED.
   - accept → status=ACCEPTED, persist providerNotes/priceMin/priceMax.
   - return { ok: true, status }

3. app/api/requests/[id]/client-answers/route.ts — POST réponses formulaire (CLIENT) :
   - requireRole("CLIENT")
   - Body { answers: Record<string, string>, freeTextSpec?: string }
   - Vérif: request.clientId === user.id, status === ACCEPTED.
   - Persist clientFormAnswers = stringifyJsonField(answers), freeTextSpec.
   - return { ok: true }

4. app/api/requests/[id]/confirm/route.ts — POST confirmation finale (PROVIDER) :
   - requireRole("PROVIDER")
   - Vérif: providerId match, status === ACCEPTED, clientFormAnswers !== null.
   - status = CONFIRMED.
   - return { ok: true, conversationId: request.id }

5. app/provider/discussion/page.tsx (refactor) :
   - Server component async.
   - const me = await requireRole("PROVIDER")
   - List ServiceRequest WHERE providerId = me.provider.id, status IN (PENDING, ACCEPTED, CONFIRMED),
     order createdAt desc, include client (firstName, lastName, district), include category.
   - 3 sections : "Nouvelles demandes" (PENDING), "Acceptées en attente du client" (ACCEPTED + clientFormAnswers null),
     "À confirmer" (ACCEPTED + clientFormAnswers !== null), "En cours" (CONFIRMED).
   - Pour chaque demande PENDING : card avec annonce IA stylée :
     "Bonjour [me.firstName], une personne aurait besoin de vous, pour [request.description]"
     (texte dans un cadre avec mini-orb à gauche — réutiliser <SiriOrb size="40px" /> existant
     depuis components/ui/siri-orb.tsx — si l'export est named depuis le spec landing, sinon
     le composant existe sous une autre forme : vérifier les imports avant).
   - Boutons "Accepter" → ouvre dialog avec textarea notes + champs priceMin/priceMax → POST respond.
              "Refuser" → confirmation native + POST respond { action: refuse }.
   - Pour ACCEPTED + clientFormAnswers null : "En attente que [client.firstName] complète son formulaire".
   - Pour ACCEPTED + clientFormAnswers !== null : afficher les réponses + freeTextSpec, bouton "Confirmer
     la mission" → POST confirm → router.push(`/provider/messages/${request.id}`).
   - Utilise Server Actions Next 16 ou route handlers via fetch côté client component imbriqué — au choix,
     mais cohérent avec le style du repo (vérifier app/(platform)/* pour le pattern existant).

6. app/provider/messages/[conversationId]/page.tsx :
   - requireRole("PROVIDER")
   - Récupère ServiceRequest WHERE id = conversationId AND providerId = me.provider.id.
   - 404 si introuvable ou pas à moi.
   - Affiche header avec client info, description, prix négocié, freeTextSpec, clientFormAnswers JSON décodé.
   - Stub messagerie : input + liste vide + texte "La messagerie sera bientôt active" — pas de WebSocket
     ni polling. C'est explicitement un stub branché, pas un faux fonctionnel.

7. app/client/discussion/results/page.tsx :
   - requireRole("CLIENT")
   - Récupère ServiceRequest WHERE clientId = me.id, order createdAt desc, include provider.user, category.
   - 4 colonnes/sections :
     a) "En attente" (PENDING) : card avec photo provider + nom + catégorie.
     b) "Acceptées — à compléter" (ACCEPTED + clientFormAnswers null) : card + bouton "Compléter ma demande"
        → ouvre dialog formulaire dynamique :
          - import { getQuestionsForCategory } from "@/lib/ai/dynamic-form"
          - Render questions dynamiquement (text/number/date/select).
          - Champ libre "Précisions supplémentaires (spé ohatra)" — textarea full-width, optionnel.
          - Submit → POST /api/requests/[id]/client-answers
     c) "Confirmées" (CONFIRMED) : card + bouton "Voir la conversation" (stub).
     d) "Non disponibles" (REFUSED) : card avec message :
        "Malheureusement, [provider.user.firstName] n'est pas disponible pour ce besoin."
        + bouton "Choisir un autre prestataire" → /client/discussion?categoryId=...

VÉRIFICATION :
- pnpm typecheck + pnpm lint clean.
- Manuel impossible sans data — laisse une note finale "Smoke test à faire : seed un user CLIENT,
  un user PROVIDER, créer une ServiceRequest manuellement via prisma studio, naviguer le flow."

NARRATION : finir par "Did/Worked/Blocked".
```

- [ ] **Step 1: Lancer l'agent (en parallèle avec A et C)**

- [ ] **Step 2: Réviser le diff**

Vérifier : pas de duplication avec A/C, KISS dans les routes (validation simple), refus poli avec wording roadmap exact, formulaire dynamique branché sur `getQuestionsForCategory` (Task 6 livre la fonction).

- [ ] **Step 3: typecheck + lint**

```bash
pnpm typecheck
pnpm lint
```

- [ ] **Step 4: Commit**

```bash
git add app/api/requests/ app/provider/ app/client/discussion/results/
git commit -m "feat(provider): parcours prestataire end-to-end (annonce IA, accept/refuse, form, confirm) + refus poli client

Did: 4 routes API requests, page provider/discussion 4 sections, messages/[id] stub branché,
     client/results 4 colonnes avec form dynamique + textarea spé ohatra.
Worked: typecheck/lint OK, status transitions PENDING → ACCEPTED → CONFIRMED protégées.
Blocked: smoke test manuel à faire avec data seedée.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 8 — Agent C : Auth, onboarding, role-guard (subagent_type: senior-polyglot-developer)

**Périmètre exclusif :**
- Modify: `proxy.ts`
- Create: `app/onboarding/page.tsx`
- Create: `app/onboarding/onboarding-form.tsx` (client component)
- Create: `app/api/onboarding/route.ts`
- Modify: `app/sign-in/[[...sign-in]]/page.tsx` *seulement* si redirectUrl à corriger
- Modify: `app/sign-up/[[...sign-up]]/page.tsx` idem
- Modify: `app/layout.tsx` *seulement* si redirect signed-in vers route par rôle nécessaire au layout (probablement non — le proxy s'en charge)

**Brief à coller à l'agent :**

```
Tu implémentes l'onboarding (CLIENT|PROVIDER + district + city + bio si provider) et le
role-guard global dans proxy.ts.

LECTURE OBLIGATOIRE :
- /home/yuta/mpanera-ai/mpanera-ai/CLAUDE.md (Clerk v7 utilise proxy.ts pas middleware.ts)
- /home/yuta/mpanera-ai/mpanera-ai/docs/superpowers/specs/2026-05-10-monolith-ai-auth-provider-design.md (§5.1, §6)
- /home/yuta/mpanera-ai/mpanera-ai/proxy.ts (existant minimal)
- /home/yuta/mpanera-ai/mpanera-ai/app/layout.tsx
- /home/yuta/mpanera-ai/mpanera-ai/app/sign-in/[[...sign-in]]/page.tsx
- /home/yuta/mpanera-ai/mpanera-ai/app/sign-up/[[...sign-up]]/page.tsx
- /home/yuta/mpanera-ai/mpanera-ai/prisma/schema.prisma (figé)
- /home/yuta/mpanera-ai/mpanera-ai/lib/auth/clerk-meta.ts (lecture seulement)

INTERDICTIONS :
- Ne pas modifier prisma/schema.prisma, lib/db.ts, lib/auth/* (autre que lecture).
- Ne pas toucher à app/api/ai/*, app/api/categories/*, app/api/providers/*, app/api/requests/*,
  app/provider/*, app/client/*, lib/ai/*.

LIVRABLES :

1. proxy.ts (refactor) :

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { readClerkMeta } from "@/lib/auth/clerk-meta"

const isPublic = createRouteMatcher([
  "/", "/sign-in(.*)", "/sign-up(.*)", "/api/webhooks/(.*)",
])
const isOnboarding = createRouteMatcher(["/onboarding", "/api/onboarding"])
const isClientArea = createRouteMatcher(["/client/(.*)"])
const isProviderArea = createRouteMatcher(["/provider/(.*)"])

export default clerkMiddleware(async (auth, req) => {
  if (isPublic(req)) return
  const { userId, sessionClaims } = await auth()
  if (!userId) return auth.protect()
  const meta = readClerkMeta(sessionClaims?.publicMetadata)
  if (!meta?.onBoardingComplete && !isOnboarding(req)) {
    return NextResponse.redirect(new URL("/onboarding", req.url))
  }
  if (isClientArea(req) && meta?.role !== "CLIENT") {
    return NextResponse.redirect(new URL("/provider/discussion", req.url))
  }
  if (isProviderArea(req) && meta?.role !== "PROVIDER") {
    return NextResponse.redirect(new URL("/client/discussion", req.url))
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
```

2. app/onboarding/page.tsx (server) :
   - export default async function OnboardingPage()
   - const { userId } = await auth(); if (!userId) redirect("/sign-in")
   - Récupère currentUser() pour pré-remplir email/firstName/lastName.
   - Si déjà sessionClaims.publicMetadata.onBoardingComplete : redirect par rôle.
   - Récupère db.category.findMany() pour le select provider.
   - Render <OnboardingForm initial={...} categories={...} />
   - Layout : centre, max-w-md, fonts du repo.

3. app/onboarding/onboarding-form.tsx (client) :
   - "use client"
   - State : role | null, district, city, categoryId | null, bio.
   - Step 1 : choix CLIENT|PROVIDER (2 grosses cards cliquables).
   - Step 2 (si CLIENT) : district (input), city (input), submit.
   - Step 2 (si PROVIDER) : district + city + select category (depuis props.categories) + bio (textarea), submit.
   - Submit → fetch POST /api/onboarding { role, district, city, categoryId?, bio? } →
     sur 200, router.refresh() + router.push selon role.
   - Pas de framer-motion lourd (KISS) — transitions opacité/translate Tailwind suffisent.

4. app/api/onboarding/route.ts — POST :
   - export const runtime = "nodejs"
   - import { auth, clerkClient, currentUser } from "@clerk/nextjs/server"
   - const { userId } = await auth(); if (!userId) return new Response("Unauthorized", { status: 401 })
   - Valider body { role: "CLIENT"|"PROVIDER", district: string, city: string,
                    categoryId?: string, bio?: string }
   - Si role === PROVIDER : categoryId requis (sinon 400).
   - currentUser() pour email + names.
   - Transaction Prisma :
     a) Upsert User { clerkId: userId, email, firstName, lastName, role, district, city,
                       onBoardingComplete: true }
     b) Si PROVIDER : créer (ou update si déjà existe) Provider { userId, categoryId, bio }.
   - clerkClient().users.updateUserMetadata(userId, {
       publicMetadata: { role, onBoardingComplete: true }
     })
   - return Response.json({ ok: true })

5. app/sign-in/[[...sign-in]]/page.tsx & app/sign-up/[[...sign-up]]/page.tsx :
   - Vérifier que les <SignIn /> / <SignUp /> Clerk ont fallbackRedirectUrl="/onboarding"
     (ou afterSignInUrl/afterSignUpUrl selon API Clerk v7).
   - Si déjà OK ou si la prop n'existe plus en v7 (utiliser ClerkProvider afterSignInUrl/afterSignUpUrl
     dans app/layout.tsx — alors modifier layout.tsx avec ces props).
   - Le but : après auth, l'utilisateur arrive sur /onboarding (le proxy le confirmera ou pas).

VÉRIFICATION :
- pnpm typecheck + pnpm lint.
- Manuel : créer un nouveau compte Clerk (via UI), vérifier redirect /onboarding, remplir form CLIENT,
  vérifier redirect /client/discussion, retenter /provider/discussion → redirect /client/discussion.

NARRATION : finir par "Did/Worked/Blocked".
```

- [ ] **Step 1: Lancer l'agent (en parallèle avec A et B)**

- [ ] **Step 2: Réviser le diff**

Vérifier : `proxy.ts` lisible, `onboarding-form.tsx` simple (pas de useReducer surdimensionné), route POST renvoie 4xx propres, pas de bug d'imbrication ClerkProvider.

- [ ] **Step 3: typecheck + lint**

```bash
pnpm typecheck
pnpm lint
```

- [ ] **Step 4: Commit**

```bash
git add proxy.ts app/onboarding/ app/api/onboarding/ app/sign-in/ app/sign-up/ app/layout.tsx
git commit -m "feat(auth): onboarding CLIENT/PROVIDER + role-guard global Clerk v7

Did: proxy.ts role-guard avec readClerkMeta, /onboarding 2 steps, route /api/onboarding upsert
     User+Provider+publicMetadata, post-sign-in redirect via Clerk.
Worked: typecheck/lint OK, redirect chain proxy → /onboarding → /client|/provider/discussion.
Blocked: vérif manuelle browser à faire (création compte test).

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Phase 3 — Intégration & smoke test (main session)

### Task 9: Intégration locale + corrections croisées

**Files:** ad hoc selon erreurs.

- [ ] **Step 1: typecheck + lint global**

```bash
pnpm typecheck
pnpm lint
```

Expected: PASS. Si fails, lire les erreurs : c'est généralement un import croisé entre A/B/C (ex : B importe `getQuestionsForCategory` depuis `lib/ai/dynamic-form` livré par A — vérifier l'export). Corriger inline.

- [ ] **Step 2: Lancer le dev server**

Run en background :
```bash
pnpm dev
```

Expected: serveur sur http://localhost:3000, pas de crash au boot. Si crash : lire la stack, corriger.

- [ ] **Step 3: Smoke test sign-up CLIENT**

Manuel browser :
1. Aller sur `/sign-up`, créer un compte test (email burner ou Clerk dev).
2. Après sign-up → doit arriver sur `/onboarding`.
3. Choisir CLIENT, district "Antananarivo", city "Antananarivo" → submit.
4. Doit arriver sur `/client/discussion`.
5. Tenter `/provider/discussion` directement dans l'URL → doit rediriger vers `/client/discussion`.

Expected: 5/5 OK. Si KO sur 2 (pas redirigé vers /onboarding) → bug `proxy.ts` (vérifier que `publicMetadata.onBoardingComplete` est bien lu après sign-up — Clerk peut mettre du temps à propager ; tester avec hard refresh).

- [ ] **Step 4: Smoke test sign-up PROVIDER**

1. Sign-out, sign-up un 2e compte.
2. Onboarding → PROVIDER, catégorie "Plomberie", district/city, bio courte.
3. Doit arriver sur `/provider/discussion` — liste vide.

- [ ] **Step 5: Smoke test parcours IA + request**

1. En tant que CLIENT (1er compte), ouvrir `/client/discussion` (front existant utilise SSE mock pour l'instant — selon spec landing). **Important** : si le front client n'appelle pas encore `/api/ai/chat` réel (mock), tester l'API directement :

```bash
curl -N -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=<copier depuis browser devtools>" \
  -d '{"message":"mon robinet fuit","turn":1}'
```

Expected: stream SSE avec deltas, en fin un event `{event:"end",sessionId,turn,...}`.

2. En DB (`pnpm prisma studio`) : 1 ligne `AiMessage` avec meta JSON `{"categorie":"plomberie",...}`.

3. Créer une ServiceRequest manuellement via Studio :
   - clientId = id du user CLIENT
   - providerId = id du Provider créé pour le 2e compte
   - categoryId = id "Plomberie"
   - description = "Robinet qui fuit"

4. Se connecter avec le 2e compte (PROVIDER), aller sur `/provider/discussion`.
5. Voir la demande PENDING, cliquer "Accepter", remplir notes/prix, submit.
6. Se reconnecter en CLIENT, aller sur `/client/discussion/results`.
7. Voir la demande "Acceptées — à compléter", remplir le formulaire dynamique + textarea spé ohatra, submit.
8. Re-PROVIDER, voir la section "À confirmer", cliquer "Confirmer la mission".
9. Doit rediriger sur `/provider/messages/<requestId>` (stub messagerie).

Expected: 9/9 OK. Si KO, fix inline.

- [ ] **Step 6: Smoke test refus**

1. Créer une 2e ServiceRequest manuelle.
2. PROVIDER refuse.
3. CLIENT voit dans `/client/discussion/results` colonne "Non disponibles" :
   *"Malheureusement, [Prénom] n'est pas disponible pour ce besoin."* + bouton alternatives.

- [ ] **Step 7: Stop dev server**

Stop le background dev.

- [ ] **Step 8: Commit final si patches d'intégration**

```bash
git add -p   # uniquement les patches d'intégration, pas du n'importe quoi
git commit -m "fix(integration): patches croisés A/B/C après fan-out

Did: corrections imports/types post-fan-out, ajustements UX mineurs.
Worked: smoke test complet 5+5+9+3 = OK.
Blocked: rotation clé NVIDIA à faire côté NVIDIA dashboard (clé encore dans historique git).

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Self-review

**1. Spec coverage :**
- §2 Objectifs (1) Prisma+seed → Tasks 1-3. (2) lib/ai → Task 6. (3) /api/ai/chat → Task 6. (4) Onboarding → Task 8. (5) Role-guard proxy.ts → Task 8. (6) Parcours prestataire → Task 7. (7) Refus poli → Task 7. ✅
- §3 Architecture : tous les fichiers du tree apparaissent dans Tasks 1-8. ✅
- §4 Schéma : Task 2 littéral. ✅
- §5 Flux : 5.1 Onboarding → Task 8 ; 5.2 IA → Task 6 ; 5.3 Requests → Task 7 ; 5.4 Respond → Task 7 ; 5.5 Form → Task 6+7 (form questions Task 6, UI Task 7) ; 5.6 Confirm → Task 7 ; 5.7 Refus poli → Task 7. ✅
- §6 Role-guard → Task 8 (code complet inline). ✅
- §7 Découpage → Tasks 6/7/8 reflètent A/B/C. ✅
- §8 Env → Task 5 + 1 (.env.example). ✅
- §9 Vérification → Task 9. ✅
- §10 Risques (webhook hors scope, form non-IA, messagerie stub, clé en historique, conflit zéro) → tous documentés ou repris dans tâches. ✅

**2. Placeholder scan :** aucun "TBD/TODO/implement later/handle edge cases". Tous les blocs de code complets. Routes API ont signatures + body validation explicites.

**3. Type consistency :**
- `AiClient.stream` (Task 6) — utilisé dans `runOrchestrator` Task 6. Cohérent.
- `getQuestionsForCategory(slug: string): DynamicFormQuestion[]` (Task 6) — consommé Task 7 (form client). Signature alignée.
- `readClerkMeta` (Task 4) — consommé Task 8 (proxy.ts). Cohérent.
- `requireRole(role: UserRole)` (Task 4) — consommé Tasks 6, 7. Cohérent.
- `parseJsonField` / `stringifyJsonField` (Task 4) — utilisés Task 6 (meta) et Task 7 (clientFormAnswers). Cohérent.
- `ServiceRequest.id` réutilisé comme `conversationId` Task 7 — explicite dans la spec §5.6.

OK plan complet, pas de gap, pas de placeholder, types alignés.

---

**Note finale utilisateur :** Après Task 9, **rotater la clé NVIDIA** côté dashboard NVIDIA. Elle est dans l'historique git (commit `78aa583`) et y restera tant qu'on ne réécrit pas l'historique (hors scope).
