# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

mpanera-ai connects talented but under-visible service providers ("prestataires") with clients in Madagascar. The differentiator is the local focus — providers are positioned as active actors of the Malagasy economy — and an AI-driven interface (NVIDIA NIM) as the primary way users discover and interact with providers.

Planned stack:

- Frontend: Next.js (this repo), deployed to Vercel
- Backend: Spring Boot, containerized with Docker (`arinfra`), deployed to Render
- Auth: Clerk (shared between frontend and backend)
- AI: NVIDIA NIM API (acts as the main UX layer, not just an add-on)

Only the Next.js frontend currently lives here. The Spring Boot backend is a separate service and is not yet present in this directory.

## User journey — read `USER_ROADMAP.md` before any UX work

`USER_ROADMAP.md` (at repo root, in French) is the source of truth for the product flow. It is **not optional reading** — every screen, transition, and animation described there is treated as part of the spec, not as decoration. Before adding/modifying any user-facing flow, re-read the relevant section.

Load-bearing constraints from the roadmap (do not drop these when implementing):

- **Two parallel journeys**: Client (landing → CTA → AI chat → provider cards → validation) and Prestataire (notification → AI announce → accept/refuse → dynamic form → messaging). Both must share the same visual language.
- **AI is the interface**, not a sidebar. The "blob" (Siri-like, Mpanera colors, ~1/3 screen on CTA, shrinks to a round icon inside the chat) carries the identity across both journeys. Loading and "thinking" states are blob animations, not generic spinners.
- **Audience is classes moyennes & populaires**: no jargon, transparent pricing, large buttons, short text, varied testimonials. Don't optimize for power users.
- **Provider cards** must show: photo, name, star rating + average, category, availability/proximity badge — multi-select with a confirmation step before notifying.
- **Refusal path is polite**: when a prestataire declines, the client gets a courteous message and is offered alternatives — never a raw error or empty state.
- **Dynamic form after acceptance** includes a free-text "spé ohatra" field for things the client may not know how to specify (e.g. exact TV specs). Keep that field.

When the roadmap and this file disagree, the roadmap wins for UX; raise the conflict with the user instead of silently picking one.

## Code quality bar — non-negotiable

Every PR goes through a **strict code review**. Submitting code that obviously skipped these is a waste of the reviewer's time.

- **KISS** — pick the simplest design that solves the problem in front of you. No speculative generality.
- **SOLID** — especially SRP (one reason to change per module/component) and DIP (depend on abstractions at boundaries: API client, auth, AI provider). The NIM AI client and the Clerk auth client must be isolated behind thin interfaces so they can be swapped or mocked.
- **Design patterns** — use them when they remove duplication or clarify intent, not as decoration. A named pattern in a PR description should answer "why this and not the obvious version."
- **Readability** — names carry the meaning. No clever one-liners that need a comment to decode. Functions do one thing; if you need "and" in the name, split it.
- **Maintainability** — leave the file better than you found it, but in the same PR's scope. Don't bundle unrelated refactors. Dead code, commented-out blocks, and TODOs without an owner are review blockers.
- **No half-implementations.** If a feature isn't finished, don't merge a partial UI behind a flag without aligning first.
- **Verify before claiming done.** `pnpm lint` and `pnpm typecheck` must pass locally; if you touched UI, exercise the flow in a browser before marking the task complete.

## Working log — narrate each action

The user wants a short running trace, not silent execution. After every meaningful action (edit, command, tool call, design decision), surface three things in the reply text:

1. **Did** — what I just did and why (one line).
2. **Worked** — what succeeded (the concrete outcome).
3. **Blocked / surprised** — errors, dead ends, wrong assumptions, retries — even minor ones. If truly nothing blocked, say so explicitly ("rien n'a bloqué"); never omit the line, because absence reads like forgetting.

Keep each trace short (bullets or a sentence). The point is to build a feedback loop and stop repeating mistakes — so favor honesty about what went wrong over a clean narrative.

## Commands

Package manager is **pnpm** (see `pnpm-lock.yaml`).

- `pnpm dev` — Next.js dev server with Turbopack
- `pnpm build` — production build
- `pnpm start` — run the production build
- `pnpm lint` — ESLint (uses flat config in `eslint.config.mjs`, extending `eslint-config-next`)
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm format` — Prettier write across `**/*.{ts,tsx}`
- Add a shadcn component: `pnpm dlx shadcn@latest add <name>` — lands in `components/ui/`

There is no test runner configured yet.

## Architecture

### Routing & layout

App Router (`app/`). `app/layout.tsx` wraps the tree in `<ClerkProvider>` and renders the global signed-in/signed-out header (`<SignInButton>`, `<SignUpButton>`, `<UserButton>` via `<Show when="...">`). Any auth-driven UI changes belong here, not duplicated per page.

### Clerk proxy lives in `proxy.ts`, not `middleware.ts` because of recent update in clerk for next 16


### Styling system

- Tailwind **v4** via `@tailwindcss/postcss` (no `tailwind.config.*` — config lives in `app/globals.css`).
- shadcn/ui configured with `style: "radix-maia"`, `baseColor: "mauve"`, icons from `lucide-react` (see `components.json`).
- Theme toggle: `components/theme-provider.tsx` wires `next-themes` and binds the `d` key to flip light/dark globally (skips inputs/contenteditable). Wrap the app in `<ThemeProvider>` if/when you start using it — it is not currently mounted in `layout.tsx`.
- Utility helper: `cn()` in `lib/utils.ts` (clsx + tailwind-merge). Prettier is configured to sort classes inside `cn()` and `cva()`.

### Path alias

`@/*` resolves to repo root (`tsconfig.json`), so imports look like `@/components/ui/button`, `@/lib/utils`, `@/hooks/...`.

### Code style

- Prettier: no semicolons, double quotes, 2-space, `printWidth: 80`, `trailingComma: "es5"`. Match this when editing — don't introduce semicolons or single quotes.
- Note: `app/layout.tsx` currently uses single quotes and is inconsistent with `.prettierrc`. Run `pnpm format` rather than hand-matching whichever style a given file happens to have.

### Secrets

`.env` is committed and contains Clerk **test** keys (`pk_test_…` / `sk_test_…`). Treat any production keys as out-of-band — do not commit them, and add a `.env.local` (already gitignored) for anything beyond the shared dev test keys.
