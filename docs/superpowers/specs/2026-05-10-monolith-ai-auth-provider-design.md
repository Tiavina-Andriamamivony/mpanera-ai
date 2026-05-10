# Design — Monolithe Prisma : IA branchée, auth par rôle, parcours prestataire

**Date :** 2026-05-10
**Branche :** `style/landing` (continue dessus)
**Scope :** Backend monolithe Next.js + Prisma SQLite, route IA `/api/ai/chat` streaming, onboarding + role-guard Clerk, parcours prestataire end-to-end (annonce IA, accept/refuse, formulaire dynamique, confirmation, redirect messagerie).
**Hors scope :** Landing visuelle (couvert par `2026-05-10-end-landing-go-ai-design.md`), partie chat client front (couvert par même spec). Cette spec **branche le backend** sous le front existant.

## 1. Contexte & motivation

L'utilisateur abandonne le Spring Boot externe : on passe **monolithe Next.js + Prisma**. L'IA actuelle (`ai/index.ts`) est un script CLI standalone avec :

- clé NVIDIA hardcodée,
- `API_BASE = ton-api.mpanera.mg` (URL bidon),
- schémas `Categorie/Prestataire` qui ne matchent pas le contrat (`docs/api.yaml`),
- endpoints fictifs (`/categories`, `/prestataires?categorie=X`, `/conversation`).

Côté front, le parcours client a un spec d'aujourd'hui pour 1.2-1.3 (front, mock IA). Le **parcours prestataire** (`app/provider/discussion`, `app/provider/messages/[conversationId]`) existe en pages mais sans backend ni logique métier. L'**onboarding** + **role-guard** sont absents : un sign-in finit sur `/`, un CLIENT peut visiter `/provider/*`.

Cette spec ouvre les fondations server-side qui permettront au front (existant + à venir) de marcher pour de vrai sur un MVP démontrable local.

## 2. Objectifs

1. Installer Prisma SQLite local + schéma 5 modèles (User, Provider, Category, AiMessage, ServiceRequest) + seed catégories.
2. Extraire la logique IA en `lib/ai/*` (orchestrator + nvidia-client) testable, swappable, secrets en env.
3. Exposer `/api/ai/chat` en streaming SSE consommable par le front.
4. Onboarding `CLIENT` / `PROVIDER` après sign-up, persistance `district` + `city`, `publicMetadata.role` + `onBoardingComplete` côté Clerk.
5. Role-guard dans `proxy.ts` : redirige post-sign-in selon rôle, bloque cross-rôle, force `/onboarding` si non complété.
6. Parcours prestataire fonctionnel : liste demandes PENDING, écran annonce IA, accept/refuse, formulaire dynamique avec textarea libre "spé ohatra", confirmation, redirect messagerie.
7. Refus poli côté client avec proposition d'alternatives (suite roadmap §2.3 cas 2).

## 3. Architecture

```
mpanera-ai/
├── prisma/
│   ├── schema.prisma         # SQLite, 5 modèles
│   └── seed.ts               # ~6 catégories (Plomberie, Électricité, Couture,
│                             # Ménage, Cours particuliers, Traiteur)
├── lib/
│   ├── db.ts                 # PrismaClient singleton (HMR-safe)
│   ├── ai/
│   │   ├── nvidia-client.ts  # interface AiClient + impl NVIDIA (clé via env)
│   │   ├── orchestrator.ts   # 3-turn loop, sans HTTP ni I/O direct
│   │   └── prompts.ts        # SYSTEM_BASE + instructions par tour
│   └── auth/
│       ├── role.ts           # getCurrentUser(), requireRole(role)
│       └── clerk-meta.ts     # helpers publicMetadata.role / onBoardingComplete
├── app/
│   ├── api/
│   │   ├── ai/chat/route.ts                  # POST stream SSE, persistance AiMessage
│   │   ├── categories/route.ts               # GET liste catégories
│   │   ├── providers/[categoryId]/route.ts   # GET top-N providers d'une catégorie
│   │   ├── requests/route.ts                 # POST batch création demandes
│   │   ├── requests/[id]/respond/route.ts    # POST accept|refuse (PROVIDER only)
│   │   ├── requests/[id]/client-answers/route.ts # POST réponses formulaire (CLIENT only)
│   │   ├── requests/[id]/confirm/route.ts    # POST confirmation finale (PROVIDER)
│   │   └── onboarding/route.ts               # POST role + district + (provider→category)
│   ├── onboarding/page.tsx                   # choix CLIENT|PROVIDER + district
│   ├── provider/
│   │   ├── discussion/page.tsx               # liste demandes PENDING + entrée annonce IA
│   │   └── messages/[conversationId]/page.tsx # messagerie (existante, branchée request)
│   └── client/
│       └── discussion/results/page.tsx       # statut demandes : pending / accepted / refused (poli)
├── proxy.ts                  # role-guard Clerk v7, redirect par rôle
├── ai/                       # CLI conservée mais wrap lib/ai/*
└── .env(.example)            # NVIDIA_API_KEY, DATABASE_URL=file:./dev.db, CLERK_*
```

**Principes appliqués :**

- **DIP** : `lib/ai/nvidia-client.ts` exporte une interface `AiClient { chat(messages, opts): AsyncIterable<string> }`. La route handler dépend de l'interface, pas de l'impl. Permet de tester l'orchestrator avec un fake client.
- **SRP** : `orchestrator.ts` ne connaît ni `fetch` ni `Request/Response` ; il prend `messages + turn` et retourne un async iterable de deltas + un `meta` final. La route s'occupe du HTTP/SSE et de la persistance.
- **KISS** : un seul flow IA pour le MVP, pas de file d'attente, pas de retries automatiques, pas de cache. Erreurs remontées en 500 + message UX.
- **Pas de speculative generality** : le `ServiceRequest` n'a pas de modèle `Conversation` séparé tant qu'on n'a pas la messagerie réelle ; `messages/[conversationId]` reste un stub branché plus tard sur ServiceRequest.id.

## 4. Schéma Prisma (canonique)

```prisma
datasource db { provider = "sqlite" url = env("DATABASE_URL") }
generator client { provider = "prisma-client-js" }

enum UserRole { CLIENT PROVIDER }
enum RequestStatus { PENDING ACCEPTED REFUSED CANCELLED CONFIRMED }

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

  provider           Provider?
  aiMessages         AiMessage[]
  clientRequests     ServiceRequest[] @relation("ClientRequests")
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
  meta       Json?
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
  clientFormAnswers Json?
  freeTextSpec      String?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  @@index([clientId, status])
  @@index([providerId, status])
}
```

**Seed minimal** (`prisma/seed.ts`) : 6 catégories (slugs : `plomberie`, `electricite`, `couture`, `menage`, `cours-particuliers`, `traiteur`) avec icônes lucide nommées. Pas de seed user/provider — créés au sign-up.

## 5. Flux applicatifs

### 5.1. Onboarding

```
sign-up Clerk → user créé côté Clerk
  → webhook Clerk (hors scope cette session — sera POST /api/webhooks/clerk plus tard)
  → en attendant : à la 1re visite signed-in, proxy.ts détecte
    !sessionClaims.publicMetadata.onBoardingComplete → redirect /onboarding
  → /onboarding : form choix CLIENT|PROVIDER + district + city
    si PROVIDER : + select category + bio (textarea)
  → POST /api/onboarding
    → upsert User local (clerkId, email, role, district, city)
    → si PROVIDER : crée Provider lié
    → setPublicMetadata côté Clerk : { role, onBoardingComplete: true }
  → redirect /client/discussion ou /provider/discussion
```

### 5.2. IA chat (route streaming)

```
POST /api/ai/chat   body: { message, sessionId? }
  → auth.protect, requireRole CLIENT
  → orchestrator.run({ message, sessionId, prevMessages })
    turn 1 : prompt diag + DIY + MPANERA_META { categorieId }
             → on fetch Provider top-5 dans la catégorie
    turn 2 : prompt confirmation
    turn 3 : prompt recommandation pros (liste injectée)
  → stream SSE deltas vers le client
  → à la fin : prisma.aiMessage.create(...) avec meta + sessionId + turn
  → si turn === 3 : renvoie aussi { providers: [...] } dans event final
```

### 5.3. Création demandes par client

```
POST /api/requests   body: { categoryId, description, providerIds: string[] }
  → requireRole CLIENT
  → prisma.serviceRequest.createMany(
      providerIds.map(pid => ({ clientId, providerId: pid, categoryId, description, status: PENDING }))
    )
  → return { ids: [...] }
```

### 5.4. Réponse prestataire

```
POST /api/requests/[id]/respond   body: { action: "accept"|"refuse", notes?, priceMin?, priceMax? }
  → requireRole PROVIDER, vérif providerId = me
  → action=refuse : status=REFUSED, return { ok }
  → action=accept : status=ACCEPTED, providerNotes/priceMin/priceMax persistés
  → côté client UI : la liste de status reflète ces changements
```

### 5.5. Formulaire dynamique client

```
Quand client visite /client/discussion/results et voit une request ACCEPTED :
  click "Compléter ma demande" →
  POST /api/requests/[id]/client-answers   body: { answers: {...}, freeTextSpec }
  → requireRole CLIENT, vérif clientId = me
  → persist clientFormAnswers + freeTextSpec
  → UI prestataire voit "réponses reçues, confirmer ?"
```

**Génération du formulaire dynamique** : MVP simple — un set de questions par catégorie codé en dur dans `lib/ai/dynamic-form.ts` (ex: Plomberie → marque appareil, urgence, adresse précise). Pas d'appel IA pour générer les questions cette session ; on garde un `freeTextSpec` libre (textarea "spé ohatra") pour combler. Itération suivante pourra brancher l'IA.

### 5.6. Confirmation prestataire → messagerie

```
POST /api/requests/[id]/confirm
  → requireRole PROVIDER, status doit être ACCEPTED + clientFormAnswers !== null
  → status=CONFIRMED
  → return { conversationId: request.id }   // on réutilise l'id pour la route messagerie
  → front redirect /provider/messages/[conversationId]
```

### 5.7. Refus poli côté client

`/client/discussion/results` regroupe les ServiceRequest du client en 3 colonnes : EN ATTENTE / ACCEPTÉES / NON DISPONIBLES. La colonne "non disponibles" affiche pour chaque pro refusant : *"Malheureusement, [Prénom] n'est pas disponible pour ce besoin."* + bouton "Choisir un autre prestataire" qui renvoie sur `/client/discussion` avec `categoryId` pré-rempli.

## 6. Role-guard `proxy.ts`

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isPublic = createRouteMatcher([
  "/", "/sign-in(.*)", "/sign-up(.*)", "/api/webhooks/(.*)"
])
const isOnboarding = createRouteMatcher(["/onboarding", "/api/onboarding"])
const isClientArea = createRouteMatcher(["/client/(.*)"])
const isProviderArea = createRouteMatcher(["/provider/(.*)"])

export default clerkMiddleware(async (auth, req) => {
  if (isPublic(req)) return
  const { userId, sessionClaims } = await auth()
  if (!userId) return auth.protect()

  const meta = sessionClaims?.publicMetadata as
    | { role?: "CLIENT" | "PROVIDER"; onBoardingComplete?: boolean }
    | undefined

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
```

Le matcher config existant reste inchangé.

## 7. Découpage subagents

**Phase 1 — main session (séquentielle, fondations) :**

1. `pnpm add prisma @prisma/client tsx` + `pnpm prisma init --datasource-provider sqlite`.
2. Écrire `prisma/schema.prisma` (§4) + `prisma/seed.ts`.
3. `pnpm prisma migrate dev --name init` + seed.
4. Écrire `lib/db.ts` (singleton HMR-safe) + `lib/auth/role.ts` + `lib/auth/clerk-meta.ts`.
5. Bouger la clé NVIDIA hardcodée vers `.env`, créer `.env.example` (gitignore vérifié), supprimer la clé en clair de `ai/index.ts`.
6. Commit "phase 1 — fondations monolithe".

**Phase 2 — fan-out, 3 subagents en parallèle (un seul message, 3 Agent calls).**

Chaque agent reçoit en brief : (a) cette spec collée, (b) `CLAUDE.md` collé, (c) son périmètre fichiers exclusif, (d) interdiction de toucher au schéma Prisma (figé), (e) consigne narration + KISS/SRP/DIP, (f) prettier sans semi.

| Agent | Type | Périmètre exclusif |
|---|---|---|
| **A — IA & API métier** | `senior-polyglot-developer` | `lib/ai/*`, `lib/ai/dynamic-form.ts`, `app/api/ai/chat/route.ts`, `app/api/categories/route.ts`, `app/api/providers/[categoryId]/route.ts`, refactor `ai/index.ts` en thin CLI sur `lib/ai/orchestrator.ts` |
| **B — Parcours prestataire & demandes** | `senior-polyglot-developer` | `app/provider/discussion/page.tsx`, `app/provider/messages/[conversationId]/page.tsx`, `app/api/requests/route.ts`, `app/api/requests/[id]/respond/route.ts`, `app/api/requests/[id]/client-answers/route.ts`, `app/api/requests/[id]/confirm/route.ts`, `app/client/discussion/results/page.tsx` (refus poli + alternatives) |
| **C — Auth, onboarding, role-guard** | `senior-polyglot-developer` | `proxy.ts`, `app/onboarding/page.tsx`, `app/api/onboarding/route.ts`, lecture `app/sign-in/...` et `app/sign-up/...` pour vérifier `redirectUrl` post-auth, `app/layout.tsx` *seulement* si redirect signed-in vers route par rôle nécessaire |

**Anti-conflit vérifié** : aucun fichier partagé entre A/B/C. `proxy.ts` et `app/layout.tsx` → C uniquement. Schéma Prisma → personne après Phase 1. Composants UI (`components/*`, `components/ui/interactive-broker-card.tsx`) → réutilisés en lecture, pas modifiés cette session (le spec landing/AI les a déjà ou les laisse).

**Phase 3 — main session (intégration) :**

- `pnpm typecheck` + `pnpm lint` clean.
- `pnpm dev`, smoke test : sign-up → onboarding (CLIENT) → /client/discussion → IA chat 3 tours → cards → POST /api/requests → connexion en PROVIDER (autre user) → /provider/discussion → accept → form client → confirm → redirect messagerie. Vérifier refus poli côté client.
- Patch des conflits d'intégration (typage, imports croisés). Commit final.

## 8. Variables d'environnement

```
# .env (gitignored, jamais commit)
NVIDIA_API_KEY=nvapi-...   # déplacé depuis ai/index.ts
DATABASE_URL=file:./dev.db
CLERK_SECRET_KEY=...        # déjà présent
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...   # déjà présent

# .env.example (commit)
NVIDIA_API_KEY=
DATABASE_URL=file:./dev.db
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
```

## 9. Vérification avant "fait"

- `pnpm typecheck` clean (zéro erreur).
- `pnpm lint` clean.
- `pnpm prisma migrate status` : `up to date`.
- Manuel : sign-up → arrive sur /onboarding (pas / ni /client).
- Manuel : finir onboarding CLIENT → arrive /client/discussion.
- Manuel : essayer /provider/discussion → redirect /client/discussion.
- Manuel : POST /api/ai/chat avec un message simple, voir le stream SSE, voir 1 ligne en DB `AiMessage`.
- Manuel : créer une ServiceRequest, se connecter en PROVIDER, accepter, remplir form client, confirmer, voir redirect messagerie.
- Aucune clé NVIDIA dans l'historique git après Phase 1 (vérifier `git log -p ai/index.ts`).

## 10. Risques & arbitrages

- **Webhook Clerk hors scope** : sans webhook, le local User n'est créé qu'à `/onboarding` (POST /api/onboarding fait l'upsert). Acceptable pour MVP démontrable. Webhook = phase suivante.
- **Formulaire dynamique non-IA** : MVP avec questions catégorie en dur + textarea "spé ohatra" (couvre la contrainte roadmap). Itération suivante = IA pour générer les questions.
- **Messagerie non-réelle** : `/provider/messages/[conversationId]` reste page existante, on lui passe ServiceRequest.id en `conversationId`. Pas de WebSocket/polling cette session. Si la page est juste un stub aujourd'hui, B la garde stub mais branchée sur la request.
- **Clé NVIDIA déjà en clair dans git** : phase 1 la sort du fichier, mais elle reste dans l'historique. **Action** : prévenir l'utilisateur de la **rotater côté NVIDIA** une fois la session finie. Ne pas tenter de réécrire l'historique git ici (destructif, hors scope).
- **Conflit avec spec landing du jour** : aucun. Cette spec touche `app/api/*`, `prisma/*`, `lib/*`, `proxy.ts`, `app/onboarding`, `app/provider/*`, `app/client/discussion/results`. Le spec landing touche `components/*`, `app/page.tsx`, `app/client/discussion/page.tsx` (front). Disjoint.
