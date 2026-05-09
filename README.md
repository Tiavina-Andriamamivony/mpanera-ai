# mpanera-ai

Plateforme qui connecte les prestataires de services malgaches — talentueux mais souvent peu visibles — avec les clients qui ont besoin d'eux. L'IA n'est pas un gadget : c'est l'interface principale. Le client décrit son besoin en langage naturel, l'IA propose les bons prestataires, et le prestataire reçoit la demande déjà cadrée.

Le produit est conçu pour les classes moyennes et populaires de Madagascar : interfaces simples, pas de jargon, prix transparents, parcours fluide.

## Stack

- **Frontend** (ce dépôt) : Next.js 16 (App Router) + React 19, TypeScript, Tailwind CSS v4, shadcn/ui, déployé sur Vercel.
- **Auth** : Clerk (partagé front / back).
- **Backend** : Spring Boot containerisé (`arinfra`), déployé sur Render — service séparé, pas dans ce dépôt.
- **IA** : NVIDIA NIM API.

## Démarrage

Pré-requis : Node ≥ 20, `pnpm`.

```bash
pnpm install
pnpm dev
```

L'application tourne sur `http://localhost:3000`.

### Variables d'environnement

Les clés Clerk de **test** partagées sont dans `.env`. Pour des clés personnelles ou de production, utilisez `.env.local` (déjà ignoré par Git) :

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

## Scripts

| Commande           | Rôle                                              |
| ------------------ | ------------------------------------------------- |
| `pnpm dev`         | serveur de dev Next.js avec Turbopack             |
| `pnpm build`       | build de production                               |
| `pnpm start`       | lance le build de production                      |
| `pnpm lint`        | ESLint (config plate, `eslint-config-next`)       |
| `pnpm typecheck`   | `tsc --noEmit`                                    |
| `pnpm format`      | Prettier sur `**/*.{ts,tsx}`                      |

Ajouter un composant shadcn :

```bash
pnpm dlx shadcn@latest add button
```

Les composants atterrissent dans `components/ui/` et s'importent via l'alias `@/components/ui/...`.

## Architecture

```
app/                # App Router (layout, pages, globals.css)
components/         # Composants applicatifs
components/ui/      # Composants shadcn (générés)
hooks/              # Hooks React partagés
lib/                # Utilitaires (cn, clients API, etc.)
proxy.ts            # Middleware Clerk (voir note ci-dessous)
USER_ROADMAP.md     # Spec UX/parcours utilisateur — référence produit
CLAUDE.md           # Guide pour les agents IA travaillant sur le repo
```

Points à connaître :

- **Le middleware Clerk est dans `proxy.ts`**, pas dans `middleware.ts`, en raison de l'évolution récente de Clerk pour Next 16.
- **Tailwind v4** : pas de `tailwind.config.*`, la config vit dans `app/globals.css`.
- **shadcn** : style `radix-maia`, `baseColor: "mauve"`, icônes `lucide-react`.
- **Theme toggle** : la touche `d` bascule clair/sombre (`components/theme-provider.tsx`, à monter quand on l'active).
- **Alias** : `@/*` pointe vers la racine du dépôt.

## Parcours utilisateur

Le parcours complet (client + prestataire, animations, design) est décrit dans [`USER_ROADMAP.md`](./USER_ROADMAP.md). C'est la source de vérité produit — à lire avant toute modification d'écran ou de flow.

## Qualité de code

Chaque PR passe par une revue de code sévère. Les attendus :

- **KISS, SOLID, design patterns** quand ils clarifient l'intention.
- **Lisibilité** : noms explicites, fonctions à responsabilité unique, pas d'astuces qui exigent un commentaire pour être comprises.
- **Maintenabilité** : pas de code mort, pas de TODO orphelins, pas de refactos non liés glissés dans la PR.
- **Frontières isolées** : le client NIM et le client Clerk doivent rester derrière des interfaces fines (testables, remplaçables).
- **Vérifications obligatoires avant push** : `pnpm lint` et `pnpm typecheck` verts ; flow exercé dans le navigateur si l'UI a bougé.

Le guide complet pour les agents (et les humains qui veulent les mêmes garde-fous) est dans [`CLAUDE.md`](./CLAUDE.md).

## Style

- Prettier : pas de point-virgule, double-quotes, indentation 2 espaces, `printWidth: 80`, `trailingComma: "es5"`.
- Plugin `prettier-plugin-tailwindcss` actif — les classes sont triées dans `cn()` et `cva()`. Lancer `pnpm format` plutôt que de s'aligner manuellement sur un fichier voisin.

## Déploiement

- **Frontend** → Vercel (push sur `main`).
- **Backend** → Render (image Docker `arinfra`, dans son propre dépôt).

## Licence

À définir.
