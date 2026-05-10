# Design — Finir la landing & démarrer le parcours AI (étape 1.2 → 1.3)

**Date :** 2026-05-10
**Branche :** `style/landing`
**Scope :** Front Next.js seulement. Parcours client jusqu'à l'interface chat de base. Pas de NIM réel, pas de cards prestataires, pas de parcours prestataire.

## 1. Objectifs

1. Donner à la landing son identité Mpanera complète : logo dans le header, sections supplémentaires "remplies" qui parlent à un public grand public malgache (catégories, témoignages).
2. Préparer la transition landing → AI : l'utilisateur clique le CTA, arrive sur `/client/discussion`, voit un SiriOrb aux couleurs Mpanera occupant ~1/3 de l'écran avec un message d'accueil et un champ de saisie. Premier message → bascule en mode chat (orb réduit en avatar rond).
3. Nettoyer les composants `siri-orb.tsx` et `ai-prompt-box.tsx` pour qu'ils soient utilisables en production (couleurs Mpanera, pas de bug SSR, pas de démo mélangée au code de prod).

## 2. État existant

- `components/landing/landing-page.tsx` : Hero + HowItWorks + Trust + FinalCta. Palette teal/cuivre OKLCH, fonts DM Serif/Fraunces/Inter, animations `.reveal` sur scroll initial. Solide, on garde.
- `components/site-header.tsx` : header flottant minimaliste, juste les CTA auth à droite. **Pas de logo.**
- `public/logo.png` : 2000×2000, dispo.
- `components/ui/siri-orb.tsx` : composant `SiriOrb` (export default) **mélangé** avec un `SiriOrbDemo` qui contient son propre `Button`, un panneau Settings, un slider — du code de démo qui n'a rien à faire en prod. Couleurs par défaut rose/cyan/violet, **pas Mpanera**.
- `components/ui/ai-prompt-box.tsx` : 813 lignes, framer-motion + radix dialog + voice recorder + file upload + canvas/think/search toggles. Thèmé sombre (`#1F2023`, `#444444` en dur). **Bug SSR** : `document.createElement` au top-level du module — crash en build prod / SSR.
- `app/client/discussion/page.tsx` : stub vide.

## 3. Découpage

Quatre unités, frontières nettes :

### 3.1. Header avec logo (`components/site-header.tsx`)
**Rôle :** brand + auth global.
**Change :** ajout d'un `<Link href="/">` à gauche contenant `<Image src="/logo.png">` (`size-9`, `rounded-xl`, `priority`) + wordmark `mpanera<span class="text-accent">.</span>ai` en `font-display text-lg`. Garde le comportement Show signed-in / signed-out à droite, garde l'exclusion `/sign-in` `/sign-up`.
**Dépend de :** `next/image`, déjà dans Next 16.

### 3.2. Refactor `siri-orb.tsx`
**Rôle :** primitive visuelle réutilisable (landing hero + AI page + futur avatar IA).
**Change :**
- Supprime `SiriOrbDemo`, son `Button` local, le panneau Settings. Pas de besoin prod.
- Export **named** `{ SiriOrb }` (plus de default). Met à jour les imports si présents (aucun aujourd'hui hors le fichier lui-même).
- Couleurs par défaut → palette Mpanera, lues via CSS vars pour suivre le thème :
  - `c1` = `var(--primary)` (teal Mpanera)
  - `c2` = `var(--accent)` (cuivre)
  - `c3` = `var(--chart-1)` (doré)
  - `bg` = `transparent` (inchangé)
- Le radial-gradient interne (clair/sombre) reste tel quel — il fonctionne déjà avec `.dark`.
- Garde les props `size` / `colors` / `animationDuration` / `className`.

### 3.3. Sections landing additionnelles (`components/landing/landing-page.tsx`)
**Rôle :** remplir la page sans diluer le message, parler "classes moyennes & populaires".
**Change :**

a) **Hero — remplacer le mock-bubble** (la card chat à droite) par un **mini-SiriOrb statique** :
- Taille `200px`, `animationDuration={30}`, `drop-shadow-2xl`.
- Le badge "Salama ô !" continue à flotter au-dessus, légèrement rotaté.
- Sous l'orb, ligne discrète : "Notre IA vous écoute" en `font-serif italic text-muted-foreground`.

b) **`Categories`** (nouvelle section, entre `HowItWorks` et `Trust`) :
- Titre `font-display text-5xl` : "Tout ce qu'il vous faut, *en quelques mots.*"
- Grille 6 catégories `sm:grid-cols-3`. Chaque card :
  - Fond `bg-secondary`, padding généreux, `rounded-3xl`, hover : `bg-card`, micro-translate.
  - Pastille `bg-accent/15` size-12 contenant l'icône (Wrench, Zap, Scissors, SprayCan, GraduationCap, ChefHat — toutes lucide).
  - Nom catégorie `font-serif text-xl`, courte description `text-sm text-muted-foreground`.
- 6 catégories : Plomberie, Électricité, Couture, Ménage, Cours particuliers, Traiteur.

c) **`Voices`** (nouvelle section, entre `Trust` et `FinalCta`) :
- Titre : "*Des vraies personnes,* de vrais résultats."
- 3 cards `font-serif italic` avec rotations légères (`-rotate-1`, `rotate-1`, `-rotate-[0.5deg]`), citation, pastille colorée avec initiales (pas de fausses photos), nom + métier + ville :
  - Mahasoa, *cliente*, Antananarivo
  - Voahangy, *couturière*, Toamasina
  - Rakoto, *plombier*, Fianarantsoa
- Pastilles colorées : `bg-primary` / `bg-accent` / `bg-[var(--chart-1)]`, texte foncé, `font-display`.

d) **CTA hero → `/client/discussion`** : aujourd'hui `useAuthCtas` renvoie `/sign-up` pour les non-signés. **Garde** ce comportement (auth-first), mais quand `isSignedIn`, le `primary.href` doit pointer vers `routeForRole(role)` qui renvoie déjà `/client/discussion` ou `/provider/discussion`. C'est déjà le cas — pas de changement.

### 3.4. `MpaneraPromptBox` (nouveau, `components/ai/mpanera-prompt-box.tsx`)
**Rôle :** champ de saisie minimal, charte Mpanera, utilisable phase intro et phase chat.
**Pourquoi pas le gros `ai-prompt-box.tsx` :** il est sombre, lourd, et a un bug SSR. On garde une version slim qui couvre 80% du besoin avec 5% du code.
**API :**
```ts
type Props = {
  onSend: (message: string) => void
  isLoading?: boolean
  placeholder?: string
  autoFocus?: boolean
  className?: string
}
```
**Comportement :**
- Textarea autosize (min 56px, max 200px).
- Enter → submit, Shift+Enter → newline.
- Bouton submit rond, `bg-primary text-primary-foreground`, icône `ArrowUp`, désactivé si vide ou `isLoading`.
- État `isLoading` → bouton montre `Square` (stop), bord `ring-2 ring-primary/40`.
- Container : `rounded-3xl border border-border bg-card shadow-xl shadow-primary/5 p-2`.
- **Pas de mic, pas de file upload, pas de canvas/think/search** dans cette session. Suffisamment pour 1.2-1.3.

**Note bug SSR du gros composant :** dans cette session, on **corrige** quand même `ai-prompt-box.tsx` (déplacer l'injection CSS top-level dans un `useEffect`) pour ne pas avoir une bombe à retardement dans le repo, même si on ne s'en sert pas dans le flow client. Patch minimal, pas de refonte.

### 3.5. `app/client/discussion/page.tsx` (l'écran AI, 2 phases)
**Rôle :** orchestrer 1.2 (intro) et 1.3 (chat) dans une seule page, transition smooth.

**State minimal (client component) :**
```ts
const [phase, setPhase] = useState<"intro" | "chat">("intro")
const [messages, setMessages] = useState<Msg[]>([])
const [isThinking, setIsThinking] = useState(false)
```

**Phase `intro` :**
- Layout centré vertical, plein viewport moins header.
- `<SiriOrb size="33vmin" animationDuration={20} />` avec `motion.div layoutId="mpanera-orb"`.
- Sous l'orb : titre `font-display` 4xl-5xl : *"Que puis-je faire pour vous aujourd'hui ?"* + sous-titre `font-serif italic text-muted-foreground` : *"Trouvons le prestataire parfait pour votre besoin."*
- 3 starter chips au-dessus du prompt : "Mon robinet fuit", "Cours particuliers en maths", "Couturière près d'Ambohibao". Click → remplit le textarea.
- `<MpaneraPromptBox onSend={handleFirstSend} autoFocus />` centré, max-width `2xl`.

**Transition `intro` → `chat` (sur premier `onSend`) :**
- `setPhase("chat")` + ajoute le message user + lance la simu IA.
- Grâce à `motion.div layoutId="mpanera-orb"`, framer-motion anime la position/taille de l'orb : 33vmin centré → 40px à gauche du header de chat. Durée ~700ms `easeInOut`.
- `prefers-reduced-motion` → on saute l'animation, on flip directement.

**Phase `chat` :**
- Header sticky en haut de la zone chat (sous le SiteHeader global) : `<SiriOrb size="40px" />` (l'orb réduit, même `layoutId`) + "mpanera" + état "en ligne" / "réfléchit…".
- Liste de bulles : `Bubble role="user"` (droite, `bg-primary text-primary-foreground`) / `Bubble role="ai"` (gauche, `bg-secondary`).
- Animation "thinking" : pendant `isThinking`, bulle IA avec 3 dots animés (déjà présente dans `Bubble pending` du landing — réutiliser le pattern).
- Réponse IA simulée : typewriter, 30ms/char, message canné en français qui demande la précision (ex : *"D'accord, dans quelle ville et quand seriez-vous disponible ?"*). Mock, pas d'appel réseau.
- `<MpaneraPromptBox>` sticky bas, `bg-background/80 backdrop-blur`.
- Auto-scroll vers le dernier message (`useEffect` + `scrollIntoView`).

**Hors scope :** vrai LLM (NIM), historique persistant, multi-conversation, sélection prestataires (1.5), validation (1.6).

## 4. Data flow

```
LandingPage (CTA "Décrire mon besoin")
      │  href = useAuthCtas().primary.href
      │  signed-out → /sign-up
      │  signed-in client → /client/discussion
      ▼
ClientDiscussionPage
      ├── phase=intro: SiriOrb 33vmin + welcome + chips + MpaneraPromptBox
      │     │  onSend(text)
      │     ▼
      │  setMessages([{role:"user", text}]); setPhase("chat"); setIsThinking(true)
      │     ▼
      │  setTimeout 600ms → mock IA reply (typewriter) → setIsThinking(false)
      │
      └── phase=chat: header(SiriOrb 40px) + Bubble[] + MpaneraPromptBox sticky
            onSend → ajoute msg user + mock reply
```

Aucun appel réseau dans cette itération.

## 5. Fichiers touchés / créés

**Touchés :**
- `components/site-header.tsx` — ajoute logo + wordmark.
- `components/landing/landing-page.tsx` — remplace mock-bubble par mini-orb, ajoute `Categories`, ajoute `Voices`.
- `components/ui/siri-orb.tsx` — supprime `SiriOrbDemo`, export named, couleurs Mpanera par défaut.
- `components/ui/ai-prompt-box.tsx` — patch SSR (déplacer injection CSS dans `useEffect`).
- `app/client/discussion/page.tsx` — implémente les 2 phases.

**Créés :**
- `components/ai/mpanera-prompt-box.tsx` — wrapper slim.
- `components/ai/chat-bubble.tsx` — extraction du `Bubble` du landing pour partage. (Ou copier-coller assumé si on veut garder zéro dépendance croisée.)

## 6. Constraints / non-négociables (extraits CLAUDE.md & ROADMAP)

- Pas de jargon, public grand public, boutons larges.
- Palette teal/cuivre OKLCH, fonts DM Serif/Fraunces/Inter — **pas** d'Inter générique en display.
- Animations smooth, blob omniprésent comme identité.
- KISS, SRP : `MpaneraPromptBox` ne fait qu'une chose, `SiriOrb` ne fait qu'une chose.
- Prettier : pas de point-virgule, double quotes, 2-space, `printWidth: 80`.
- `pnpm lint` + `pnpm typecheck` doivent passer.
- Refus prestataire poli, dynamique form "spé ohatra", cards prestataires : **pas dans cette session** mais ne pas créer de structure qui les bloquerait.

## 7. Découpage subagent vs main

- **Subagent** (lancé en parallèle) : §3.4 `MpaneraPromptBox`, §3.5 `/client/discussion` 2 phases, patch SSR §3.4. Brief autonome, pas besoin de revenir au main.
- **Main session** : §3.1 header, §3.2 refactor SiriOrb (le subagent en dépend → fait avant le lancement), §3.3 sections landing.

## 8. Vérification avant de dire "fait"

- `pnpm typecheck` clean.
- `pnpm lint` clean.
- `pnpm dev` : ouvrir `/`, vérifier logo, sections rempli, mini-orb dans hero.
- Cliquer le CTA non-signé → `/sign-up` (existant). Simuler signed-in (impossible sans clerk dev) — au moins vérifier la cible côté code (`routeForRole`).
- Ouvrir `/client/discussion` directement (route non protégée par middleware ?  à vérifier — proxy.ts) : voir l'orb 33vmin centré, taper un message, voir la transition vers chat avec orb réduit + réponse simulée.
- Mode dark (touche `d` si `<ThemeProvider>` mounté — sinon ignorer).

## 9. Risques

- **Transition `layoutId`** entre 33vmin et 40px peut sauter si `motion.div` n'enveloppe pas vraiment le même `SiriOrb` à travers les phases — il faut soit garder le SiriOrb monté en permanence et juste changer le wrapper de layout, soit utiliser `<AnimatePresence mode="popLayout">`. Solution simple : un seul `<SiriOrb>` rendu à la racine de la page avec `layoutId`, positionné conditionnellement par classe (centré vs ancré header) — c'est le pattern documenté framer-motion.
- **Subagent qui touche `siri-orb.tsx` après refactor** : non, le main fait le refactor avant le lancement. Subagent travaille avec l'API stabilisée.
- **`document.createElement` au top-level d'`ai-prompt-box.tsx`** : crash en build. Patch obligatoire même si on n'utilise pas le composant — sinon `pnpm build` échoue.
