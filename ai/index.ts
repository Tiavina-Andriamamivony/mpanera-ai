import crypto from "crypto"

const INVOKE_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
const API_BASE = "https://ton-api.mpanera.mg"
const MAX_TURNS = 3

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

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: "system" | "user" | "assistant"
  content: string
}
interface Categorie {
  id: string
  label: string
}
interface Prestataire {
  nom: string
  quartier: string
  note: number
  tel: string
  prix_min: number
  prix_max: number
}
interface Session {
  id: string
  turn: number
  history: Message[]
  prestataires?: Prestataire[]
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

const SYSTEM_BASE = `Tu es Mpanera, IA de mpanera.mg. Français simple (A2-A1). Jamais "je suis une IA".
CONTEXTE MADAGASCAR : Délestage, saison des pluies, prix en Ariary (Ar). Recommander un pro du même quartier.`

// ─── Fonctions Utilitaires ───────────────────────────────────────────────────

async function fetchCategories(): Promise<Categorie[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`)
    return res.ok ? await res.json() : []
  } catch {
    return []
  }
}

async function fetchPrestataires(
  categorie: string,
  quartier: string
): Promise<Prestataire[]> {
  try {
    const params = new URLSearchParams({ categorie, quartier, limit: "3" })
    const res = await fetch(`${API_BASE}/prestataires?${params}`)
    return res.ok ? await res.json() : []
  } catch {
    return []
  }
}

async function saveConversation(session: Session, meta: any): Promise<void> {
  try {
    await fetch(`${API_BASE}/conversation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: session.id,
        turn: session.turn,
        history: session.history,
        meta,
      }),
    })
  } catch {
    /* silencieux */
  }
}

function extractMeta(text: string): any {
  const match = text.match(/MPANERA_META:(\{[^}]+\})/)
  try {
    return match ? JSON.parse(match[1]) : null
  } catch {
    return null
  }
}

function stripMeta(text: string): string {
  return text.replace(/MPANERA_META:\{[^}]+\}\n?/, "").trim()
}

async function callIA(
  history: Message[],
  instruction: string
): Promise<string> {
  const messages: Message[] = [
    { role: "system", content: `${SYSTEM_BASE}\n\n${instruction}` },
    ...history.filter((m) => m.role !== "system"),
  ]

  const response = await fetch(INVOKE_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      model: "moonshotai/kimi-k2.6",
      messages,
      temperature: 0.4,
      stream: true,
    }),
  })

  if (!response.ok) throw new Error("Erreur API NVIDIA")

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let full = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const lines = decoder.decode(value).split("\n")
    for (const line of lines) {
      if (!line.startsWith("data: ") || line.includes("[DONE]")) continue
      try {
        const delta = JSON.parse(line.slice(6)).choices[0].delta.content || ""
        process.stdout.write(delta)
        full += delta
      } catch {}
    }
  }
  process.stdout.write("\n")
  return full
}

// ─── Logique Principale ──────────────────────────────────────────────────────

async function main() {
  const userMessage = process.argv[2]?.trim()
  const sessionArg = process.argv[3]

  if (!userMessage) return console.error("Message utilisateur manquant.")

  // 1. Initialisation Session
  let session: Session
  try {
    session = sessionArg
      ? JSON.parse(sessionArg)
      : { id: crypto.randomUUID(), turn: 1, history: [] }
  } catch {
    session = { id: crypto.randomUUID(), turn: 1, history: [] }
  }

  if (session.turn > MAX_TURNS) {
    console.log("Session terminée. Merci !")
    process.exit(0)
  }

  session.history.push({ role: "user", content: userMessage })

  // 2. Détermination de l'instruction par étape
  let instruction = ""

  if (session.turn === 1) {
    const categories = await fetchCategories()
    instruction = `ÉTAPE 1/3 : Analyse le problème. Fais un diagnostic court et donne 3 conseils DIY.
CATÉGORIES DISPOS : ${categories.map((c) => c.id).join(", ")}.
Obligation : Finis par MPANERA_META:{"categorie":"ID_CATEGORIE","quartier":"NOM_OU_INCONNU"}`
  } else if (session.turn === 2) {
    instruction = `ÉTAPE 2/3 : Demande à l'utilisateur si les conseils ont aidé. S'il dit non ou si c'est grave, prépare-le à l'idée d'appeler un professionnel.`
  } else {
    const liste = session.prestataires?.length
      ? JSON.stringify(session.prestataires)
      : "Pas de pro trouvé."
    instruction = `ÉTAPE 3/3 (DERNIER MESSAGE) : Confirme qu'un pro doit intervenir. 
Voici les prestataires recommandés : ${liste}. 
Donne leurs coordonnées et conclus poliment. Ne pose plus de questions.`
  }

  // 3. Appel IA
  const aiRaw = await callIA(session.history, instruction)
  const meta = extractMeta(aiRaw)
  const aiText = stripMeta(aiRaw)

  // 4. Actions spécifiques
  if (session.turn === 1 && meta) {
    // On pré-charge les pros dès le tour 1 pour qu'ils soient dispos au tour 3
    session.prestataires = await fetchPrestataires(
      meta.categorie,
      meta.quartier || "inconnu"
    )
  }

  // 5. Sauvegarde et Update
  session.history.push({ role: "assistant", content: aiText })
  await saveConversation(session, meta || {})
  session.turn += 1

  // 6. Sortie pour le frontend
  process.stdout.write(`\nMPANERA_SESSION:${JSON.stringify(session)}\n`)
}

main().catch(console.error)
